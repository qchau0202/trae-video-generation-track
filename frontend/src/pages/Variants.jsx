import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function Variants() {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const qs = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
    const { data } = await api.get(`/variants${qs}`);
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Variants</div>
          <div className="text-sm text-gray-600 mt-1">System-managed campaign variants.</div>
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <div className="font-bold">Filter</div>
          <input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Campaign ID (optional)"
          />
          <button onClick={load} className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50" type="button">
            Apply
          </button>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <div className="bg-white border rounded-2xl p-6">
          {items.length === 0 ? <div className="text-sm text-gray-600">No variants found.</div> : null}
          <div className="space-y-2">
            {items.map((v) => (
              <div key={v._id} className="border rounded-xl p-4">
                <div className="text-sm font-semibold">{v.variantType}</div>
                <div className="text-xs text-gray-500 mt-1">status: {v.status}</div>
                <div className="text-xs text-gray-500 mt-1">campaignId: {v.campaignId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

