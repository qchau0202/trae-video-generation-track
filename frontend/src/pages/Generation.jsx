import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, ChevronRight, RefreshCw } from 'lucide-react'

function Generation() {
  const { vaultId, videoId } = useParams()
  const navigate = useNavigate()
  const { vaults, videos, startVideoGeneration, regenerateVideo, setActiveVaultId } = useApp()
  const vault = vaults.find((v) => v.id === vaultId) || null
  const video = videos.find((v) => v.id === videoId && v.vaultId === vaultId) || null
  const status = video?.status
  const canGenerate = status === 'draft'
  const isGenerating = status === 'generating'
  const isReady = status === 'ready'
  const job = video?.job

  useEffect(() => {
    if (!vaultId) return
    setActiveVaultId(vaultId)
  }, [setActiveVaultId, vaultId])

  const shots = useMemo(() => {
    const rawShots = job?.remote?.raw?.shots
    return Array.isArray(rawShots) ? rawShots : []
  }, [job?.remote?.raw?.shots])

  const shotDoneCount = useMemo(() => {
    if (!shots.length) return 0
    return shots.filter((s) => (s.status === 1 || String(s.status || '').toLowerCase() === 'success') && s.url).length
  }, [shots])

  const asset = (video?.videoAssets || [])[0] || null

  if (!video || !vault) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-sm font-semibold text-slate-900">Video not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              <span className="text-slate-700">Generate</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Generation</h1>
            <div className="mt-2 text-xs text-slate-500">
              {video.generation?.model || 'PixVerse V6'} • Status: {video.status} • {video.generation?.aspectRatio || '9:16'} •{' '}
              {video.generation?.durationSec || 30}s
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
              className="btn-secondary"
            >
              Adjust settings
            </button>
            {isReady ? (
              <button
                type="button"
                onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
                className="btn-secondary"
              >
                Open preview
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
            {canGenerate ? (
              <button
                type="button"
                onClick={() => startVideoGeneration(video.id)}
                className="btn-primary"
              >
                Start generation
              </button>
            ) : null}
          </div>
        </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="text-sm font-semibold text-slate-900">PixVerse V6 job</div>
          <div className="subtitle">
            {isReady ? 'Ready.' : isGenerating ? 'Generating with PixVerse V6…' : 'Not started yet.'}
          </div>
        </div>
        <div className="card-body">
          {canGenerate ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Click “Start generation” to create the video using PixVerse V6.
            </div>
          ) : null}

          {job?.error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              PixVerse error: {job.error}
            </div>
          ) : null}

        {shots.length ? (
          <div className={`mt-5 rounded-2xl border border-slate-200 bg-white p-5 ${isGenerating ? '' : 'hidden md:block'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">30s assembly (6 shots)</div>
              <div className="text-xs text-slate-500">
                {shotDoneCount}/{shots.length} ready
              </div>
            </div>
            {job?.remote?.raw?.assembling ? <div className="mt-2 text-xs text-slate-500">Assembling final 30s video…</div> : null}
            <div className="mt-4 grid gap-2">
              {shots.map((s, idx) => (
                <div key={s.taskId || idx} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800">
                      Shot {Number.isFinite(s.index) ? s.index + 1 : idx + 1}: {s.label || 'Shot'}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      s.status === 1
                        ? 'text-emerald-700'
                        : s.status === 5
                          ? 'text-trae-700'
                          : s.status === 8 || s.status === 7
                            ? 'text-rose-700'
                            : 'text-slate-500'
                    }`}
                  >
                    {s.status === 1 ? 'ready' : s.status === 5 ? 'running' : s.status === 8 ? 'failed' : s.status === 7 ? 'blocked' : 'pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className={`grid gap-4 md:grid-cols-2 ${isGenerating ? 'mt-5' : ''}`}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Idea</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {video.ideaText || '—'}
            </div>
            <details className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <summary className="cursor-pointer select-none text-sm font-medium text-slate-700">Prompt details</summary>
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prompt</div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {video.generation?.prompt || '—'}
                  </div>
                </div>
                {video.generation?.negativePrompt ? (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Negative</div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                      {video.generation.negativePrompt}
                    </div>
                  </div>
                ) : null}
              </div>
            </details>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {asset?.url && isReady ? (
              <video src={asset.url} controls className="w-full aspect-[9/16] max-h-[70vh] bg-black object-contain" />
            ) : (
              <div className="relative flex aspect-[9/16] w-full items-center justify-center bg-slate-100 text-slate-600">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-trae-600" />
                    <div className="text-sm font-medium text-slate-700">Generating 30s campaign video…</div>
                    {shots.length ? (
                      <div className="text-xs text-slate-500">
                        {shotDoneCount}/{shots.length} shots ready
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-sm">No video yet</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)} className="btn-secondary">
            Adjust settings
          </button>
          {isReady ? (
            <button
              type="button"
              onClick={() => {
                regenerateVideo(video.id)
                navigate(`/vault/${vault.id}/videos/${video.id}/generate`)
              }}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate now
            </button>
          ) : null}
          {isReady ? (
            <button
              type="button"
              onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
              className="btn-primary"
            >
              Open preview
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        </div>
      </div>

      {isReady ? (
        <div className="card">
          <div className="card-body flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Done</div>
              <div className="mt-1 text-sm text-slate-600">Open the version to export or regenerate.</div>
            </div>
            <button type="button" onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)} className="btn-primary">
              Open version
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Generation
