import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import PixVerseVideo from '../components/PixVerseVideo';
import { api } from '../api/client';

function statusBadge(status) {
  const map = {
    draft: 'bg-gray-100 text-gray-700',
    generating: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    archived: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

function variantLabel(variantType) {
  if (variantType === 'problem-hook') return 'Hook A (Problem)';
  if (variantType === 'trend-hook') return 'Hook B (Trend)';
  if (variantType === 'discount-hook') return 'Hook C (Discount)';
  return 'Variant';
}

export default function CampaignDetail() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('9:16');
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [vote, setVote] = useState(5);
  const [comment, setComment] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const campaignId = params.id;

  const variants = data?.variants || [];
  const videoAssets = data?.videoAssets || [];
  const jobs = data?.jobs || [];

  const selectedVariant = useMemo(() => variants.find((v) => v._id === selectedVariantId) || null, [
    variants,
    selectedVariantId,
  ]);

  const selectedVideo = useMemo(() => {
    if (!selectedVariant) return null;
    const match = videoAssets.find((a) => a.variantId === selectedVariant._id && a.format === selectedFormat);
    if (match) return match;
    return videoAssets.find((a) => a.variantId === selectedVariant._id) || null;
  }, [videoAssets, selectedVariant, selectedFormat]);

  const load = async () => {
    const { data: resp } = await api.get(`/campaigns/${campaignId}`);
    setData(resp);
    const nextSelected = selectedVariantId || resp.variants?.[0]?._id || '';
    setSelectedVariantId(nextSelected);
  };

  const loadFeedback = async (variantId) => {
    if (!variantId) return;
    const { data: resp } = await api.get(`/feedback?variantId=${encodeURIComponent(variantId)}`);
    setFeedbackItems(resp.items);
  };

  useEffect(() => {
    let alive = true;
    load()
      .then(() => {})
      .catch((err) => alive && setError(err?.response?.data?.message || err?.message || 'Failed to load'));
    return () => {
      alive = false;
    };
  }, [campaignId]);

  useEffect(() => {
    if (!selectedVariantId) return;
    loadFeedback(selectedVariantId).catch(() => {});
  }, [selectedVariantId]);

  useEffect(() => {
    if (data?.campaign?.status !== 'generating') return;
    const t = setInterval(() => {
      load().catch(() => {});
    }, 1500);
    return () => clearInterval(t);
  }, [data?.campaign?.status]);

  const generate = async ({ regenerate } = { regenerate: false }) => {
    setError('');
    setLoading(true);
    try {
      await api.post(`/campaigns/${campaignId}/generate`, { regenerate });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Generate failed');
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedVariantId) return;
    setError('');
    try {
      await api.post('/feedback', { variantId: selectedVariantId, vote, comment });
      setComment('');
      await loadFeedback(selectedVariantId);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Feedback failed');
    }
  };

  const createShareLink = async () => {
    setError('');
    try {
      const { data: resp } = await api.post('/share-links', {
        campaignId,
        permissions: ['view', 'comment', 'vote'],
      });
      const url = `${window.location.origin}/share/${resp.item.token}`;
      setShareUrl(url);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Share link failed');
    }
  };

  const exportBundle = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/export-bundles', { campaignId });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const jobRows = useMemo(() => {
    if (!selectedVariant) return [];
    return jobs
      .filter((j) => j.variantId === selectedVariant._id)
      .sort((a, b) => String(a.format).localeCompare(String(b.format)));
  }, [jobs, selectedVariant]);

  if (!data?.campaign) {
    return (
      <AppShell>
        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold">Loading…</div>
          {error ? <div className="text-sm text-red-600 mt-2">{error}</div> : null}
        </div>
      </AppShell>
    );
  }

  const campaign = data.campaign;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-xl font-black truncate">{campaign.name}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(campaign.status)}`}>{campaign.status}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Campaign ID: {campaign._id}</div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => generate({ regenerate: false })}
                disabled={loading}
                className="bg-primary text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                type="button"
              >
                Generate
              </button>
              <button
                onClick={() => generate({ regenerate: true })}
                disabled={loading}
                className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
                type="button"
              >
                Regenerate
              </button>
              <button
                onClick={createShareLink}
                className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50"
                type="button"
              >
                Create share link
              </button>
              <button
                onClick={exportBundle}
                disabled={loading}
                className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50 disabled:opacity-60"
                type="button"
              >
                Export bundle
              </button>
            </div>
          </div>

          {shareUrl ? (
            <div className="mt-4 text-sm">
              Share URL:{' '}
              <Link className="text-primary font-semibold break-all" to={shareUrl.replace(window.location.origin, '')}>
                {shareUrl}
              </Link>
            </div>
          ) : null}

          {error ? <div className="text-sm text-red-600 mt-3">{error}</div> : null}
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-2">
            {variants.map((v) => (
              <button
                key={v._id}
                onClick={() => setSelectedVariantId(v._id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                  v._id === selectedVariantId ? 'bg-primary text-white border-primary' : 'hover:bg-gray-50'
                }`}
                type="button"
              >
                {variantLabel(v.variantType)} · {v.status}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <div className="text-sm text-gray-500">Format</div>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-6">
            <div className="font-bold mb-4">Preview</div>
            {selectedVideo ? (
              <PixVerseVideo videoSrc={selectedVideo.videoUrl} />
            ) : (
              <div className="text-sm text-gray-600">No video ready for this variant yet.</div>
            )}
            {selectedVideo ? (
              <div className="text-xs text-gray-500 mt-3">
                {selectedVideo.format} · {selectedVideo.durationSeconds}s
              </div>
            ) : null}

            <div className="mt-6">
              <div className="font-bold mb-2">Jobs</div>
              {jobRows.length === 0 ? <div className="text-sm text-gray-600">No jobs yet.</div> : null}
              <div className="space-y-2">
                {jobRows.map((j) => (
                  <div key={j._id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{j.format}</div>
                      <div className="text-xs text-gray-500">{j.status}</div>
                    </div>
                    <div className="text-xs text-gray-500 max-w-64 truncate">{j.errorMessage || j.providerJobId || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-6">
            <div className="font-bold mb-4">Feedback</div>
            <form onSubmit={submitFeedback} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-sm font-medium">Vote (1-5)</label>
                  <input
                    value={vote}
                    onChange={(e) => setVote(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    type="number"
                    min={1}
                    max={5}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Comment</label>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    placeholder="What works / what to improve?"
                  />
                </div>
              </div>
              <button className="bg-primary text-white rounded-lg px-4 py-2 font-semibold" type="submit">
                Add feedback
              </button>
            </form>

            <div className="mt-6 space-y-2">
              {feedbackItems.length === 0 ? <div className="text-sm text-gray-600">No feedback yet.</div> : null}
              {feedbackItems.map((f) => (
                <div key={f._id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold">{f.authorName || 'User'}</div>
                    <div className="text-xs text-gray-500">{f.vote ? `Vote: ${f.vote}` : ''}</div>
                  </div>
                  {f.comment ? <div className="text-sm text-gray-700 mt-1">{f.comment}</div> : null}
                  <div className="text-xs text-gray-500 mt-2">{new Date(f.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

