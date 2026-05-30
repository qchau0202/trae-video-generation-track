import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function VideoAssets() {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (campaignId) params.set('campaignId', campaignId);
    if (variantId) params.set('variantId', variantId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/video-assets${qs}`);
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Video Assets</div>
          <div className="text-sm text-gray-600 mt-1">Generated outputs per variant and format.</div>
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <div className="font-bold">Filter</div>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Campaign ID (optional)"
            />
            <input
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Variant ID (optional)"
            />
          </div>
          <button onClick={load} className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50" type="button">
            Apply
          </button>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="bg-white border rounded-2xl p-6">
          {items.length === 0 ? <div className="text-sm text-gray-600">No assets found.</div> : null}
          <div className="space-y-2">
            {items.map((a) => (
              <div key={a._id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">
                    {a.format} · {a.durationSeconds}s
                  </div>
                  <a className="text-sm text-primary font-semibold" href={a.videoUrl} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </div>
                <div className="text-xs text-gray-500 mt-1">campaignId: {a.campaignId}</div>
                <div className="text-xs text-gray-500 mt-1">variantId: {a.variantId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

