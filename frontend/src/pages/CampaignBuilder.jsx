import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import Dropzone from '../components/Dropzone'
import { ArrowRight, Play, PlusCircle, RefreshCw } from 'lucide-react'

function CampaignBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { vaults, videos, createVideoVersion, startVideoGeneration, regenerateVideo, setActiveVaultId } = useApp()
  const vault = vaults.find((v) => v.id === id) || null

  const [ideaText, setIdeaText] = useState('')
  const [ideaAttachment, setIdeaAttachment] = useState(null)
  const [durationSec, setDurationSec] = useState(30)
  const [ctaText, setCtaText] = useState('Shop Now')
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)

  const versions = useMemo(() => {
    const fallbackVaultId = vaults[0]?.id || null
    return videos.filter((v) => (v.vaultId || fallbackVaultId) === id)
  }, [id, vaults, videos])

  const looksBinary = (text) => {
    const sample = String(text || '').slice(0, 2000)
    let weird = 0
    for (let i = 0; i < sample.length; i++) {
      const code = sample.charCodeAt(i)
      if (code === 0) return true
      if (code < 9) weird++
    }
    return weird > 2
  }

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })

  const handleIdeaFiles = async (files) => {
    const file = files?.[0]
    if (!file) return
    try {
      const raw = await readFileAsText(file)
      if (!looksBinary(raw) && raw.trim()) {
        setIdeaText(raw.slice(0, 2000))
      }
      setIdeaAttachment({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
      })
      setError('')
    } catch {
      setError('Could not read that file. Try a .txt file for this demo.')
      setIdeaAttachment({ name: file.name, type: file.type || 'application/octet-stream', size: file.size })
    }
  }

  if (!vault) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold">Vault not found</div>
      </div>
    )
  }

  const canCreate = Boolean((ideaText || '').trim()) && (vault.productImages || []).length >= 1

  const createVersion = () => {
    setError('')
    if (!canCreate) {
      setError('Add an idea and upload at least 1 product image in the Vault first.')
      return
    }
    const created = createVideoVersion(vault.id, {
      ideaText,
      ideaAttachment,
      generation: { durationSec, ctaText },
    })
    setActiveVaultId(vault.id)
    navigate(`/vault/${vault.id}/videos/${created.id}`)
  }

  const askGenerate = (videoId) => {
    const v = versions.find((x) => x.id === videoId) || null
    const mode = v?.status === 'ready' ? 'regenerate' : 'generate'
    setConfirm({ videoId, mode })
  }

  const confirmGenerate = () => {
    if (!confirm?.videoId) return
    if (confirm.mode === 'regenerate') regenerateVideo(confirm.videoId)
    else startVideoGeneration(confirm.videoId)
    navigate(`/vault/${vault.id}/videos/${confirm.videoId}/generate`)
    setConfirm(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Vault</div>
            <h1 className="mt-1 text-2xl font-semibold">{vault.name}</h1>
            <div className="mt-2 text-sm text-slate-600">Create and manage versions of ad videos from this vault.</div>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/vault/${vault.id}`)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View vault assets
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">Video versions</div>
              <div className="text-xs font-medium text-slate-500">{versions.length}</div>
            </div>

            {versions.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No versions yet. Create one on the right.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold">Version</div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            v.status === 'ready'
                              ? 'bg-emerald-50 text-emerald-700'
                              : v.status === 'generating'
                                ? 'bg-trae-100 text-trae-700'
                                : v.status === 'failed'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {v.status}
                        </span>
                        <span className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-2 line-clamp-2 text-sm text-slate-700">{v.ideaText || '—'}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVaultId(vault.id)
                          navigate(`/vault/${vault.id}/videos/${v.id}`)
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open
                      </button>
                      {v.status === 'generating' ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/vault/${vault.id}/videos/${v.id}/generate`)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-trae-600 px-3 py-2 text-sm font-medium text-white hover:bg-trae-700"
                        >
                          <Play className="h-4 w-4" />
                          View
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => askGenerate(v.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-trae-600 px-3 py-2 text-sm font-medium text-white hover:bg-trae-700"
                        >
                          {v.status === 'ready' ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          {v.status === 'ready' ? 'Regenerate' : 'Generate'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">New version</div>
              <PlusCircle className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-2 text-sm text-slate-600">Add an idea (type or upload a file). Then generate.</div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Campaign idea</label>
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                  placeholder="e.g., Soy milk launch promo: show pouring, creamy texture, highlight high protein, end with Shop Now."
                />
              </div>

              <Dropzone
                label="Or upload idea file"
                hint=".txt recommended (we try to extract text)"
                accept=".txt,.md,.csv,.doc,.docx,text/plain"
                onFiles={handleIdeaFiles}
              />

              {ideaAttachment ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Attached: <span className="font-medium">{ideaAttachment.name}</span>
                </div>
              ) : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Duration</label>
                  <select
                    value={durationSec}
                    onChange={(e) => setDurationSec(Number(e.target.value))}
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
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-trae-600"
                  >
                    <option>Shop Now</option>
                    <option>Learn More</option>
                    <option>Get Offer</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={createVersion}
                disabled={!canCreate}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white ${
                  canCreate ? 'bg-trae-600 hover:bg-trae-700' : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                Create version
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-lg font-semibold">Generate ad video?</div>
            <div className="mt-2 text-sm text-slate-600">
              Liquid will send the vault assets + idea to PixVerse V6 to generate a new video version.
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
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

export default CampaignBuilder
