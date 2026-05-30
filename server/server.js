import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import ffmpegPath from 'ffmpeg-static'

const PORT = Number(process.env.PORT || 8787)
const PIXVERSE_CLI_BASE = process.env.PIXVERSE_CLI_BASE || 'npx'

const app = express()
app.use(cors())
app.use(express.json({ limit: '15mb' }))

const OUTPUTS_DIR = path.join(process.cwd(), 'outputs')
fs.mkdir(OUTPUTS_DIR, { recursive: true }).catch(() => null)
app.use('/outputs', express.static(OUTPUTS_DIR, { maxAge: '1h' }))

const campaigns = new Map()

function dataUrlToBlob(dataUrl) {   
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid image data URL')
  const mime = match[1]
  const base64 = match[2]
  const bytes = Buffer.from(base64, 'base64')
  return { mime, bytes }
}

async function writeTempImage(dataUrl) {
  const { mime, bytes } = dataUrlToBlob(dataUrl)
  const ext = mime === 'image/jpeg' ? 'jpg' : mime === 'image/webp' ? 'webp' : 'png'
  const filePath = path.join(os.tmpdir(), `liquid-pixverse-${randomUUID()}.${ext}`)
  await fs.writeFile(filePath, bytes)
  return filePath
}

function runCommand(cmd, args, { timeoutMs = 180000 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      const err = new Error('PixVerse CLI timeout')
      err.status = 504
      err.details = { cmd, args }
      reject(err)
    }, timeoutMs)

    child.stdout.on('data', (d) => {
      stdout += d.toString()
    })
    child.stderr.on('data', (d) => {
      stderr += d.toString()
    })
    child.on('error', (e) => {
      clearTimeout(timer)
      const err = new Error(`Failed to run command: ${e.message}`)
      err.status = 502
      err.details = { cmd, args }
      reject(err)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr })
    })
  })
}

async function runPixverse(args, opts) {
  if (PIXVERSE_CLI_BASE === 'pixverse') {
    const res = await runCommand('pixverse', args, opts)
    if (res.code === 0) return res
    const err = new Error('PixVerse CLI failed')
    err.status = 502
    err.details = { args, stdout: res.stdout, stderr: res.stderr, code: res.code }
    throw err
  }

  const res = await runCommand(PIXVERSE_CLI_BASE, ['-y', 'pixverse', ...args], opts)
  if (res.code === 0) return res
  const err = new Error('PixVerse CLI failed')
  err.status = 502
  err.details = { args, stdout: res.stdout, stderr: res.stderr, code: res.code }
  throw err
}

function safeJsonParse(text) {
  try {
    return JSON.parse(String(text || ''))
  } catch {
    return null
  }
}

function extractVideoUrl(obj) {
  if (!obj || typeof obj !== 'object') return null
  return (
    obj.url ||
    obj.video_url ||
    obj.videoUrl ||
    obj.video?.url ||
    obj.output?.video ||
    obj.output?.url ||
    obj.result?.url ||
    obj.data?.url ||
    null
  )
}

function mapCliStatus(raw) {
  if (raw === 1 || raw === 5 || raw === 7 || raw === 8) return raw
  if (typeof raw === 'number') return raw
  const s = String(raw || '').toUpperCase()
  if (!s) return 0
  if (s.includes('SUCCESS') || s.includes('COMPLETED') || s.includes('DONE')) return 1
  if (s.includes('IN_PROGRESS') || s.includes('PROCESS') || s.includes('RUNNING') || s.includes('PENDING')) return 5
  if (s.includes('MODERATION')) return 7
  if (s.includes('FAILED') || s.includes('ERROR')) return 8
  return 0
}

async function downloadToFile(url, filePath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  const arrayBuffer = await res.arrayBuffer()
  await fs.writeFile(filePath, Buffer.from(arrayBuffer))
}

async function assembleConcatMp4({ campaignId, shotFiles }) {
  if (!ffmpegPath) throw new Error('ffmpeg-static not available')
  const outputPath = path.join(OUTPUTS_DIR, `${campaignId}.mp4`)
  const inputs = []
  for (const filePath of shotFiles) {
    inputs.push('-i', filePath)
  }

  const concatInputs = shotFiles.map((_, idx) => `[${idx}:v:0]`).join('')
  const filter = `${concatInputs}concat=n=${shotFiles.length}:v=1:a=0[outv]`

  const args = [
    '-hide_banner',
    '-loglevel',
    'error',
    ...inputs,
    '-filter_complex',
    filter,
    '-map',
    '[outv]',
    '-an',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-crf',
    '23',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    outputPath,
  ]
  const r = await runCommand(ffmpegPath, args, { timeoutMs: 8 * 60 * 1000 })
  if (r.code !== 0) {
    const err = new Error('Failed to assemble final video')
    err.status = 502
    err.details = { stdout: r.stdout, stderr: r.stderr }
    throw err
  }
  return outputPath
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, cli: PIXVERSE_CLI_BASE })
})

app.post('/api/pixverse/v6/generate', async (req, res, next) => {
  try {
    const {
      prompt,
      negativePrompt,
      aspectRatio = '9:16',
      durationSec = 30,
      quality = '720p',
      generateAudio = false,
      imageDataUrl,
    } = req.body || {}

    const finalPrompt = String(prompt || '').trim()
    if (!finalPrompt) {
      res.status(400).json({ error: 'prompt_required' })
      return
    }

    const requestedDuration = Number(durationSec) || 30
    const aspect = String(aspectRatio || '9:16')
    const argsBase = [
      'create',
      'video',
      '--model',
      'v6',
      '--quality',
      String(quality || '720p'),
      '--aspect-ratio',
      aspect,
      '--json',
      '--no-wait',
    ]

    let imagePath = null
    try {
      if (imageDataUrl) imagePath = await writeTempImage(imageDataUrl)

      if (requestedDuration >= 30) {
        const campaignId = `camp_${randomUUID()}`
        const shots = [
          { label: 'Hook', seconds: 5 },
          { label: 'Product', seconds: 5 },
          { label: 'Benefit', seconds: 5 },
          { label: 'Proof', seconds: 5 },
          { label: 'Offer', seconds: 5 },
          { label: 'CTA', seconds: 5 },
        ]

        const createdShots = []
        for (let i = 0; i < shots.length; i++) {
          const shot = shots[i]
          const shotPrompt = `${finalPrompt}\n\nShot ${i + 1}/6 (${shot.label}, ${shot.seconds}s). Keep brand colors, product clearly visible, vertical ad safe margins.`
          const argsFull = [
            ...argsBase,
            '--prompt',
            shotPrompt,
            '--duration',
            String(shot.seconds),
            '--negative-prompt',
            String(negativePrompt || ''),
            ...(generateAudio ? ['--audio'] : ['--no-audio']),
            ...(imagePath ? ['--image', imagePath] : []),
          ]

          let output = null
          try {
            const r = await runPixverse(argsFull)
            output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
          } catch {
            const minimalArgs = [...argsBase, '--prompt', shotPrompt, ...(imagePath ? ['--image', imagePath] : [])]
            const r = await runPixverse(minimalArgs)
            output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
          }

          const videoId = output?.video_id ?? output?.videoId ?? output?.id ?? null
          if (videoId === null || videoId === undefined) {
            const err = new Error('PixVerse CLI did not return video_id')
            err.status = 502
            err.details = { output }
            throw err
          }

          createdShots.push({
            index: i,
            label: shot.label,
            seconds: shot.seconds,
            taskId: String(videoId),
            status: 5,
            url: null,
          })
        }

        campaigns.set(campaignId, {
          campaignId,
          createdAt: Date.now(),
          aspect,
          requestedDuration,
          prompt: finalPrompt,
          negativePrompt: String(negativePrompt || ''),
          shots: createdShots,
          assembling: false,
          finalUrl: null,
          finalPath: null,
        })

        res.json({ videoId: campaignId, mode: 'campaign-30s', raw: { shots: createdShots } })
        return
      }

      const duration = Math.max(1, Math.min(15, requestedDuration))
      const argsFull = [
        ...argsBase,
        '--prompt',
        finalPrompt,
        '--duration',
        String(duration),
        '--negative-prompt',
        String(negativePrompt || ''),
        ...(generateAudio ? ['--audio'] : ['--no-audio']),
        ...(imagePath ? ['--image', imagePath] : []),
      ]

      let output = null
      try {
        const r = await runPixverse(argsFull)
        output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
      } catch {
        const minimalArgs = [...argsBase, '--prompt', finalPrompt, ...(imagePath ? ['--image', imagePath] : [])]
        const r = await runPixverse(minimalArgs)
        output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
      }

      const videoId = output?.video_id ?? output?.videoId ?? output?.id ?? null
      if (videoId === null || videoId === undefined) {
        const err = new Error('PixVerse CLI did not return video_id')
        err.status = 502
        err.details = { output }
        throw err
      }

      res.json({ videoId, mode: imagePath ? 'image-to-video' : 'text-to-video', raw: output || null })
    } finally {
      if (imagePath) {
        try {
          await fs.unlink(imagePath)
        } catch {
          null
        }
      }
    }
  } catch (err) {
    next(err)
  }
})

app.get('/api/pixverse/v6/status/:videoId', async (req, res, next) => {
  try {
    const videoId = req.params.videoId
    if (String(videoId).startsWith('camp_')) {
      const entry = campaigns.get(String(videoId))
      if (!entry) {
        res.status(404).json({ status: 8, url: null, raw: { error: 'campaign_not_found' } })
        return
      }

      const updatedShots = []
      let anyFailed = false
      let doneCount = 0
      for (const shot of entry.shots) {
        const r = await runPixverse(['task', 'status', String(shot.taskId), '--json'], { timeoutMs: 60000 })
        const output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
        const url = extractVideoUrl(output)
        const statusRaw = output?.status ?? output?.state ?? output?.job_status ?? null
        const status = mapCliStatus(statusRaw)
        if (status === 8 || status === 7) anyFailed = true
        if (status === 1 && url) doneCount += 1
        updatedShots.push({ ...shot, status, url: url || null })
      }

      entry.shots = updatedShots

      if (anyFailed) {
        res.json({ status: 8, url: null, raw: { shots: updatedShots } })
        return
      }

      if (doneCount === updatedShots.length && !entry.finalUrl && !entry.assembling) {
        entry.assembling = true
        const campaignId = entry.campaignId
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `liquid-shots-${campaignId}-`))
        try {
          const shotFiles = []
          for (const s of updatedShots) {
            const fp = path.join(tempDir, `shot-${String(s.index).padStart(2, '0')}.mp4`)
            await downloadToFile(s.url, fp)
            shotFiles.push(fp)
          }
          const finalPath = await assembleConcatMp4({ campaignId, shotFiles })
          entry.finalPath = finalPath
          entry.finalUrl = `/outputs/${campaignId}.mp4`
        } catch (e) {
          entry.assembling = false
          const err = new Error(e?.message || 'Assemble failed')
          err.status = 502
          err.details = e?.details || null
          throw err
        } finally {
          try {
            const files = await fs.readdir(tempDir)
            await Promise.all(files.map((f) => fs.unlink(path.join(tempDir, f)).catch(() => null)))
            await fs.rmdir(tempDir).catch(() => null)
          } catch {
            null
          }
          entry.assembling = false
        }
      }

      if (entry.finalUrl) {
        res.json({ status: 1, url: entry.finalUrl, raw: { shots: updatedShots, finalUrl: entry.finalUrl, assembling: false } })
        return
      }

      res.json({
        status: 5,
        url: null,
        raw: { shots: updatedShots, assembling: Boolean(entry.assembling), doneCount, total: updatedShots.length },
      })
      return
    }

    const r = await runPixverse(['task', 'status', String(videoId), '--json'], { timeoutMs: 60000 })
    const output = safeJsonParse(r.stdout) || safeJsonParse(r.stderr)
    const url = extractVideoUrl(output)
    const statusRaw = output?.status ?? output?.state ?? output?.job_status ?? null
    const status = mapCliStatus(statusRaw)
    res.json({ status, url, raw: output || { stdout: r.stdout, stderr: r.stderr } })
  } catch (err) {
    next(err)
  }
})

app.use((err, req, res, next) => {
  const status = err?.status || 500
  res.status(status).json({
    error: err?.message || 'server_error',
    details: err?.details || null,
  })
})

if (process.env.NO_LISTEN !== '1') {
  app.listen(PORT, () => {
    process.stdout.write(`PixVerse CLI proxy running on http://localhost:${PORT}\n`)
  })
}
