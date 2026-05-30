import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import Dropzone from '../components/Dropzone'
import { ArrowRight, ChevronRight, Play, PlusCircle, RefreshCw } from 'lucide-react'

function CampaignBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { vaults, videos, createVideoVersion, startVideoGeneration, regenerateVideo, setActiveVaultId } = useApp()
  const vault = vaults.find((v) => v.id === id) || null

  const [ideaText, setIdeaText] = useState('')
  const [ideaAttachment, setIdeaAttachment] = useState(null)
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
      <div className="card">
        <div className="card-body">
          <div className="text-sm font-semibold text-slate-900">Vault not found</div>
        </div>
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
      generation: { durationSec: 30, ctaText },
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
                <span className="text-slate-700">Videos</span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Video versions</h1>
              <div className="subtitle">30s campaign video (6 shots). Create a version, then confirm generation.</div>
              <div className="mt-3 text-xs text-slate-500">
                {(vault.productImages || []).length} product images • {vault.logoUrl ? 'Logo added' : 'No logo'} • PixVerse V6 • 30s •{' '}
                {vault.productCategory || '—'} • {vault.productType || '—'}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate(`/vault/${vault.id}`)} className="btn-secondary">
                Vault assets
              </button>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('new-version')
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="btn-primary"
              >
                New version
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="card-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">All versions</div>
                <div className="mt-1 text-sm text-slate-600">Open to edit anything. Generate is always confirmed.</div>
              </div>
              <div className="text-xs text-slate-500">{versions.length} total</div>
            </div>
            </div>
            <div className="card-body">

            {versions.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No versions yet. Create one in the “New version” panel.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="divide-y divide-slate-200 bg-white">
                  {versions.map((v) => (
                    <div key={v.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-slate-900">Version</div>
                          <span
                            className={`text-xs font-medium ${
                              v.status === 'ready'
                                ? 'text-emerald-700'
                                : v.status === 'generating'
                                  ? 'text-trae-700'
                                  : v.status === 'failed'
                                    ? 'text-rose-700'
                                    : 'text-slate-500'
                            }`}
                          >
                            {v.status}
                          </span>
                          <span className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-2 line-clamp-2 text-sm text-slate-700">{v.ideaText || '—'}</div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveVaultId(vault.id)
                            navigate(`/vault/${vault.id}/videos/${v.id}`)
                          }}
                          className="btn-secondary"
                        >
                          Open
                        </button>
                        {v.status === 'generating' ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/vault/${vault.id}/videos/${v.id}/generate`)}
                            className="btn-primary"
                          >
                            <Play className="h-4 w-4" />
                            View job
                          </button>
                        ) : (
                          <button type="button" onClick={() => askGenerate(v.id)} className="btn-primary">
                            {v.status === 'ready' ? <RefreshCw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            {v.status === 'ready' ? 'Regenerate' : 'Generate'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>

        <div className="space-y-6">
          <div id="new-version" className="card lg:sticky lg:top-24">
            <div className="card-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">New version</div>
                <div className="mt-1 text-sm text-slate-600">Fast input. No polishing step.</div>
              </div>
              <PlusCircle className="h-5 w-5 text-slate-500" />
            </div>
            </div>

            <div className="card-body space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Required: at least 1 product image in{' '}
                <button
                  type="button"
                  onClick={() => navigate(`/vault/${vault.id}`)}
                  className="font-medium text-trae-700 hover:underline"
                >
                  Vault assets
                </button>
                .
              </div>
              <div>
                <label className="label">Campaign idea</label>
                <textarea
                  value={ideaText}
                  onChange={(e) => setIdeaText(e.target.value)}
                  rows={5}
                  className="textarea"
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
                  <label className="label">Duration</label>
                  <div className="input flex items-center justify-between">
                    <span>30s</span>
                    <span className="text-xs text-slate-500">6 shots</span>
                  </div>
                </div>
                <div>
                  <label className="label">CTA</label>
                  <select value={ctaText} onChange={(e) => setCtaText(e.target.value)} className="select">
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
                className="btn-primary w-full"
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
          <div className="card w-full max-w-md">
            <div className="card-body">
            <div className="text-lg font-semibold">{confirm.mode === 'regenerate' ? 'Regenerate video?' : 'Generate video?'}</div>
            <div className="mt-2 text-sm text-slate-600">
              This uses your vault assets (logo, palette, product images) plus the version idea. You can edit details in “Open”.
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmGenerate}
                className="btn-primary"
              >
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

export default CampaignBuilder
