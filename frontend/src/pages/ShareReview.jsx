import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ThumbsDown, ThumbsUp, Zap } from 'lucide-react'

function ShareReview() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { campaigns, voteOnVariant, addComment } = useApp()
  const campaign = useMemo(() => campaigns.find((c) => c.shareToken === token), [campaigns, token])

  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [authorName, setAuthorName] = useState('')
  const [commentText, setCommentText] = useState('')

  const variants = campaign?.variants || []
  const activeVariantId = selectedVariantId || variants[0]?.id || null
  const activeFeedback = activeVariantId ? campaign?.feedbackByVariantId?.[activeVariantId] : null
  const activeVariant = variants.find((v) => v.id === activeVariantId) || null

  const add = () => {
    if (!activeVariantId) return
    addComment({ campaignId: campaign.id, variantId: activeVariantId, authorName, text: commentText })
    setCommentText('')
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Share link not found</div>
          <div className="mt-1 text-sm text-slate-600">Ask the campaign owner for a fresh link.</div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
            >
              Go to Liquid
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-trae-600 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Liquid Review</div>
              <div className="text-xs text-slate-500">No login required</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm font-semibold">Pick a variant</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`rounded-2xl border p-4 text-left ${
                  activeVariantId === v.id ? 'border-trae-600 bg-trae-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-sm font-semibold">{v.hookLabel}</div>
                <div className="mt-1 text-xs text-slate-600">{v.status === 'ready' ? 'Ready' : 'Generating'}</div>
              </button>
            ))}
          </div>
        </div>

        {activeVariant ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {activeVariant.status === 'ready' && activeVariant.videoAssets?.[0]?.url ? (
                <video src={activeVariant.videoAssets[0].url} controls className="w-full aspect-[9/16] max-h-[70vh] bg-black" />
              ) : (
                <div className="flex aspect-[9/16] w-full items-center justify-center bg-slate-100 text-slate-600">
                  Rendering…
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-sm font-semibold">Feedback</div>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => voteOnVariant({ campaignId: campaign.id, variantId: activeVariant.id, direction: 'up' })}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {activeFeedback?.votes?.up || 0}
                </button>
                <button
                  type="button"
                  onClick={() => voteOnVariant({ campaignId: campaign.id, variantId: activeVariant.id, direction: 'down' })}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {activeFeedback?.votes?.down || 0}
                </button>
              </div>

              <div className="mt-4 space-y-2">
                <label className="block text-sm font-medium text-slate-700">Name (optional)</label>
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-trae-600"
                  placeholder="Reviewer"
                />
              </div>

              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-slate-700">Comment</label>
                <div className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-trae-600"
                    placeholder="Quick feedback…"
                  />
                  <button
                    type="button"
                    onClick={add}
                    className="rounded-lg bg-trae-600 px-4 py-2 text-sm font-medium text-white hover:bg-trae-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {(activeFeedback?.comments || []).slice(0, 6).map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs font-semibold text-slate-700">{c.authorName || 'Reviewer'}</div>
                    <div className="mt-1 text-sm text-slate-700">{c.text}</div>
                  </div>
                ))}
                {(activeFeedback?.comments || []).length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    No comments yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

export default ShareReview
