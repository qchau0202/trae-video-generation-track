import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Download, RefreshCw } from 'lucide-react'

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
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold">Video not found</div>
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Video version</h1>
            <div className="mt-1 text-sm text-slate-600">
              {video.generation?.model || 'PixVerse V6'} • {video.status} • Vault: {vault.name}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/vault/${vault.id}/videos`)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to versions
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
            >
              <Download className="h-4 w-4" />
              Export package
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {asset?.url && video.status === 'ready' ? (
            <video src={asset.url} controls className="w-full aspect-[9/16] max-h-[75vh] bg-black object-cover" />
          ) : (
            <div className="flex aspect-[9/16] w-full items-center justify-center bg-slate-100 text-slate-600">
              {video.status === 'generating' ? 'Rendering…' : 'No video yet'}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold">Settings</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Campaign idea</label>
                <textarea
                    value={video.ideaText || ''}
                    onChange={(e) => updateVideo(video.id, { ideaText: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Duration</label>
                  <select
                      value={video.generation?.durationSec || 30}
                      onChange={(e) => updateVideo(video.id, { generation: { durationSec: Number(e.target.value) } })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                  >
                    <option value={15}>15s</option>
                    <option value={20}>20s</option>
                    <option value={30}>30s</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">CTA</label>
                  <select
                      value={video.generation?.ctaText || 'Shop Now'}
                      onChange={(e) => updateVideo(video.id, { generation: { ctaText: e.target.value } })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                  >
                    <option>Shop Now</option>
                    <option>Learn More</option>
                    <option>Get Offer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Prompt</label>
                <textarea
                    value={video.generation?.prompt || ''}
                    onChange={(e) => updateVideo(video.id, { generation: { prompt: e.target.value } })}
                  rows={7}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={resetPromptToAuto}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset to auto
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Negative prompt (optional)</label>
                <input
                    value={video.generation?.negativePrompt || ''}
                    onChange={(e) => updateVideo(video.id, { generation: { negativePrompt: e.target.value } })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Actions</div>
              <div className="text-xs font-medium text-slate-500">{(vault.productImages || []).length} vault images</div>
            </div>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={!canGenerate}
                onClick={() => requestGenerate(video.status === 'ready' ? 'regenerate' : 'generate')}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
                  canGenerate ? 'bg-trae-600 hover:bg-trae-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {video.status === 'ready' ? 'Regenerate video' : 'Generate video'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold">Confirm generation</div>
            <div className="mt-2 text-sm text-slate-600">
              This will generate a new ad video in PixVerse V6 using your vault assets and current settings.
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmGenerate}
                className="rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
              >
                Confirm & start
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default CampaignDetail
