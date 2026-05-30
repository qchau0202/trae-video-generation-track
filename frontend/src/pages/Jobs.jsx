import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function Jobs() {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (campaignId) params.set('campaignId', campaignId);
    if (variantId) params.set('variantId', variantId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const { data } = await api.get(`/generation-jobs${qs}`);
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Jobs</div>
          <div className="text-sm text-gray-600 mt-1">PixVerse job orchestration state.</div>
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
          {items.length === 0 ? <div className="text-sm text-gray-600">No jobs found.</div> : null}
          <div className="space-y-2">
            {items.map((j) => (
              <div key={j._id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">
                    {j.format} · {j.status}
                  </div>
                  <div className="text-xs text-gray-500">{j.attempts ? `attempts: ${j.attempts}` : ''}</div>
                </div>
                <div className="text-xs text-gray-500 mt-1">campaignId: {j.campaignId}</div>
                <div className="text-xs text-gray-500 mt-1">variantId: {j.variantId}</div>
                {j.errorMessage ? <div className="text-xs text-red-600 mt-2">{j.errorMessage}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

