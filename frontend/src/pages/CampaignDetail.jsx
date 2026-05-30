import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { ChevronRight, Download, RefreshCw } from 'lucide-react'

function CampaignDetail() {
  const { vaultId, videoId } = useParams()
  const navigate = useNavigate()
  const { vaults, videos, updateVideo, rebuildVideoPrompt, startVideoGeneration, regenerateVideo } = useApp()
  const vault = useMemo(() => vaults.find((v) => v.id === vaultId) || null, [vaultId, vaults])
  const video = useMemo(() => videos.find((v) => v.id === videoId && v.vaultId === vaultId) || null, [videoId, videos, vaultId])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMode, setConfirmMode] = useState('generate')

  if (!vault || !video) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-sm font-semibold text-slate-900">Video not found</div>
        </div>
      </div>
    )
  }

  const asset = (video.videoAssets || [])[0] || null
  const canGenerate = Boolean((video.ideaText || '').trim()) && (vault.productImages || []).length > 0

  const handleExport = async () => {
    const zip = new JSZip()
    const exportManifest = {
      vault,
      video,
    }

    zip.file('manifest.json', JSON.stringify(exportManifest, null, 2))
    zip.file(
      'prompt.txt',
      [
        video.generation?.prompt ? `PROMPT:\n${video.generation.prompt}\n` : '',
        video.generation?.negativePrompt ? `\nNEGATIVE:\n${video.generation.negativePrompt}\n` : '',
        video.ideaText ? `\nIDEA:\n${video.ideaText}\n` : '',
      ]
        .filter(Boolean)
        .join('')
    )

    const exportVideos = []
    const exportAsset = asset?.url ? { name: 'video.mp4', url: asset.url } : null
    if (exportAsset) exportVideos.push(exportAsset)

    for (const item of exportVideos) {
      try {
        const res = await fetch(item.url)
        const blob = await res.blob()
        zip.file(`videos/${item.name}`, blob)
      } catch {
        zip.file(`videos/${item.name}.txt`, `Could not fetch video. URL: ${item.url}`)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `liquid-video-${video.id}.zip`)
  }

  const resetPromptToAuto = () => {
    const prompt = rebuildVideoPrompt(video.id)
    if (prompt) updateVideo(video.id, { generation: { prompt } })
  }

  const requestGenerate = (mode) => {
    setConfirmMode(mode)
    setConfirmOpen(true)
  }

  const confirmGenerate = () => {
    if (confirmMode === 'regenerate') {
      regenerateVideo(video.id)
    } else {
      startVideoGeneration(video.id)
    }
    setConfirmOpen(false)
    navigate(`/vault/${vault.id}/videos/${video.id}/generate`)
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <button type="button" onClick={() => navigate('/')} className="hover:text-slate-700">
                  Vaults
                </button>
                <ChevronRight className="h-4 w-4" />
                <button type="button" onClick={() => navigate(`/vault/${vault.id}`)} className="hover:text-slate-700">
                  {vault.name}
                </button>
                <ChevronRight className="h-4 w-4" />
                <button type="button" onClick={() => navigate(`/vault/${vault.id}/videos`)} className="hover:text-slate-700">
                  Videos
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-700">Version</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Version details</h1>
              <div className="mt-2 text-xs text-slate-500">
                {video.generation?.model || 'PixVerse V6'} • Status: {video.status} • {video.generation?.durationSec || 30}s •{' '}
                {video.generation?.aspectRatio || '9:16'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => navigate(`/vault/${vault.id}/videos`)} className="btn-secondary">
                Back to versions
              </button>
              <button type="button" onClick={handleExport} className="btn-primary">
                <Download className="h-4 w-4" />
                Export package
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card lg:col-span-3">
          {asset?.url && video.status === 'ready' ? (
            <video src={asset.url} controls className="w-full aspect-[9/16] max-h-[75vh] bg-black object-contain" />
          ) : (
            <div className="flex aspect-[9/16] w-full items-center justify-center bg-slate-100 text-slate-600">
              {video.status === 'generating' ? 'Rendering…' : 'No video yet'}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card lg:sticky lg:top-24">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-900">Edit settings</div>
              <div className="subtitle">Adjust anything. Prompt can be auto-reset from vault + idea.</div>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Campaign idea</label>
                <textarea
                  value={video.ideaText || ''}
                  onChange={(e) => updateVideo(video.id, { ideaText: e.target.value })}
                  rows={4}
                  className="textarea"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="label">Duration</label>
                  <div className="input flex items-center justify-between">
                    <span>30s</span>
                    <span className="text-xs text-slate-500">6 shots</span>
                  </div>
                </div>
                <div>
                  <label className="label">CTA</label>
                  <select
                    value={video.generation?.ctaText || 'Shop Now'}
                    onChange={(e) => updateVideo(video.id, { generation: { ctaText: e.target.value } })}
                    className="select"
                  >
                    <option>Shop Now</option>
                    <option>Learn More</option>
                    <option>Get Offer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Prompt</label>
                <textarea
                  value={video.generation?.prompt || ''}
                  onChange={(e) => updateVideo(video.id, { generation: { prompt: e.target.value } })}
                  rows={7}
                  className="textarea"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={resetPromptToAuto}
                    className="btn-secondary"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset to auto
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Negative prompt (optional)</label>
                <input
                  value={video.generation?.negativePrompt || ''}
                  onChange={(e) => updateVideo(video.id, { generation: { negativePrompt: e.target.value } })}
                  className="input"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Uses vault assets: {(vault.productImages || []).length} product image(s) • Palette from logo/colors • Optional brand files.
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  disabled={!canGenerate}
                  onClick={() => requestGenerate(video.status === 'ready' ? 'regenerate' : 'generate')}
                  className="btn-primary w-full"
                >
                  {video.status === 'ready' ? 'Regenerate video' : 'Generate video'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/vault/${vault.id}/videos`)}
                  className="btn-secondary w-full"
                >
                  Back to versions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card w-full max-w-md">
            <div className="card-body">
              <div className="text-lg font-semibold text-slate-900">Confirm generation</div>
              <div className="mt-2 text-sm text-slate-600">
                This will generate an ad video in PixVerse V6 using your vault assets and current settings.
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setConfirmOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={confirmGenerate} className="btn-primary">
                  Confirm & start
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CampaignDetail
