import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, RefreshCw } from 'lucide-react'

function StatusPill({ status }) {
  const styles =
    status === 'ready'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'generating'
        ? 'bg-trae-100 text-trae-700'
        : status === 'failed'
          ? 'bg-rose-50 text-rose-700'
          : 'bg-slate-100 text-slate-700'
  const label =
    status === 'ready' ? 'Ready' : status === 'generating' ? 'Generating' : status === 'failed' ? 'Failed' : 'Draft'
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{label}</span>
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold">Video not found</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">Generate</h1>
              <StatusPill status={video.status} />
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {video.generation?.model || 'PixVerse V6'} • {video.generation?.aspectRatio || '9:16'} • {video.generation?.durationSec || 30}s • Vault: {vault.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canGenerate ? (
              <button
                type="button"
                onClick={() => startVideoGeneration(video.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
              >
                Generate
              </button>
            ) : null}
            {isReady ? (
              <button
                type="button"
                onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Open preview
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-sm font-semibold">PixVerse V6 job</div>
        <div className="mt-1 text-sm text-slate-600">
          {isReady ? 'Ready.' : isGenerating ? 'Generating ad video in PixVerse V6…' : 'Waiting to start.'}
        </div>

        {isGenerating ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div>Progress</div>
              <div>{Math.round(progress * 100)}%</div>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-trae-600 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
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
          <button
            type="button"
            onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Adjust settings
          </button>
          {isReady ? (
            <button
              type="button"
              onClick={() => {
                regenerateVideo(video.id)
                navigate(`/vault/${vault.id}/videos/${video.id}/generate`)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate now
            </button>
          ) : null}
          {isReady ? (
            <button
              type="button"
              onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
            >
              Open preview
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {isReady ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold">Done</div>
              <div className="mt-1 text-sm text-slate-600">Preview the result and export the prompt/config package.</div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/vault/${vault.id}/videos/${video.id}`)}
              className="inline-flex items-center gap-2 rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
            >
              Open preview
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Generation
