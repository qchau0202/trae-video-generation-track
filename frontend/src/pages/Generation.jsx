import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, ChevronRight, RefreshCw } from 'lucide-react'

function StatusPill({ status }) {
  const label =
    status === 'ready' ? 'Ready' : status === 'generating' ? 'Generating' : status === 'failed' ? 'Failed' : 'Draft'
  const klass =
    status === 'ready'
      ? 'badge-success'
      : status === 'generating'
        ? 'badge-brand'
        : status === 'failed'
          ? 'badge-danger'
          : 'badge-slate'
  return <span className={klass}>{label}</span>
}

function Generation() {
  const { vaultId, videoId } = useParams()
  const navigate = useNavigate()
  const { vaults, videos, rebuildVideoPrompt, startVideoGeneration, regenerateVideo, setActiveVaultId } = useApp()
  const vault = vaults.find((v) => v.id === vaultId) || null
  const video = videos.find((v) => v.id === videoId && v.vaultId === vaultId) || null
  const [now, setNow] = useState(() => Date.now())
  const status = video?.status
  const canGenerate = status === 'draft'
  const isGenerating = status === 'generating'
  const isReady = status === 'ready'
  const job = video?.job

  useEffect(() => {
    if (!vaultId) return
    setActiveVaultId(vaultId)
  }, [setActiveVaultId, vaultId])

  useEffect(() => {
    if (!videoId) return
    if (!video) return
    if (video.status !== 'draft') return
    rebuildVideoPrompt(videoId)
    startVideoGeneration(videoId)
  }, [rebuildVideoPrompt, startVideoGeneration, video, videoId])

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(intervalId)
  }, [])

  const progress = useMemo(() => {
    if (!job?.startedAt || !job?.etaMs) return 0
    const pct = (now - job.startedAt) / job.etaMs
    return Math.max(0, Math.min(1, pct))
  }, [job?.etaMs, job?.startedAt, now])

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
            <div className="flex items-center gap-2">
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Generation</h1>
              <StatusPill status={video.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge-brand">{video.generation?.model || 'PixVerse V6'}</span>
              <span className="badge-slate">{video.generation?.aspectRatio || '9:16'}</span>
              <span className="badge-slate">{video.generation?.durationSec || 30}s</span>
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
          <div className="text-sm font-semibold text-slate-900">PixVerse job</div>
          <div className="subtitle">{isReady ? 'Ready.' : isGenerating ? 'Generating ad video…' : 'Waiting to start.'}</div>
        </div>
        <div className="card-body">

        {isGenerating ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>Progress</div>
              <div>{Math.round(progress * 100)}%</div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-trae-600 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
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
              <video src={asset.url} controls className="w-full aspect-[9/16] max-h-[70vh] bg-black object-cover" />
            ) : (
              <div className="flex aspect-[9/16] w-full items-center justify-center bg-slate-100 text-slate-600">
                {isGenerating ? 'Rendering…' : 'No video yet'}
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
