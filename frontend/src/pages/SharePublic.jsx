import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import PixVerseVideo from '../components/PixVerseVideo';
import { publicApi } from '../api/client';

function variantLabel(variantType) {
  if (variantType === 'problem-hook') return 'Hook A (Problem)';
  if (variantType === 'trend-hook') return 'Hook B (Trend)';
  if (variantType === 'discount-hook') return 'Hook C (Discount)';
  return 'Variant';
}

export default function SharePublic() {
  const params = useParams();
  const token = params.token;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('9:16');
  const [authorName, setAuthorName] = useState('Guest');
  const [vote, setVote] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const variants = data?.variants || [];
  const videoAssets = data?.videoAssets || [];
  const feedbackItems = data?.feedback || [];
  const permissions = data?.link?.permissions || [];

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
    const { data: resp } = await publicApi.get(`/share/${token}`);
    setData(resp);
    const nextSelected = selectedVariantId || resp.variants?.[0]?._id || '';
    setSelectedVariantId(nextSelected);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, [token]);

  const canComment = permissions.includes('comment') || permissions.includes('vote');

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!canComment) return;
    setError('');
    setSubmitting(true);
    try {
      await publicApi.post(`/share/${token}/feedback`, {
        variantId: selectedVariantId,
        authorName,
        vote,
        comment,
      });
      setComment('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Feedback failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-2xl font-black">{data?.campaign?.name || 'Shared campaign'}</div>
          <div className="text-sm text-gray-600 mt-1">Preview variants, vote, and leave feedback.</div>
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
                {variantLabel(v.variantType)}
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

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Preview</div>
          {selectedVideo ? (
            <PixVerseVideo videoSrc={selectedVideo.videoUrl} />
          ) : (
            <div className="text-sm text-gray-600">No video available for this variant yet.</div>
          )}
        </div>

        {canComment ? (
          <div className="bg-white border rounded-2xl p-6">
            <div className="font-bold mb-4">Leave feedback</div>
            <form onSubmit={submitFeedback} className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
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
                <div className="md:col-span-1">
                  <label className="text-sm font-medium">Comment</label>
                  <input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2"
                    placeholder="Quick note…"
                  />
                </div>
              </div>
              <button
                disabled={submitting}
                className="bg-primary text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                type="submit"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </form>
          </div>
        ) : null}

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Feedback</div>
          {feedbackItems.length === 0 ? <div className="text-sm text-gray-600">No feedback yet.</div> : null}
          <div className="space-y-2">
            {feedbackItems.map((f) => (
              <div key={f._id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{f.authorName || 'Guest'}</div>
                  <div className="text-xs text-gray-500">{f.vote ? `Vote: ${f.vote}` : ''}</div>
                </div>
                {f.comment ? <div className="text-sm text-gray-700 mt-1">{f.comment}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

