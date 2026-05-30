import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function ExportBundles() {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await api.get('/export-bundles');
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  const create = async () => {
    setError('');
    setLoading(true);
    try {
      if (!campaignId) throw new Error('campaignId is required');
      await api.post('/export-bundles', { campaignId });
      setCampaignId('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/export-bundles/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Export Bundles</div>
          <div className="text-sm text-gray-600 mt-1">Generate a bundle record containing all variant outputs.</div>
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <div className="font-bold">Create bundle</div>
          <input
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Campaign ID"
          />
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button
            disabled={loading}
            onClick={create}
            className="bg-primary text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
            type="button"
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Bundles</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No bundles yet.</div> : null}
          <div className="space-y-2">
            {items.map((b) => (
              <div key={b._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Bundle: {b._id}</div>
                  <div className="text-xs text-gray-500 mt-1">campaign: {b.campaignId}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    items: {Array.isArray(b.items) ? b.items.length : 0}
                  </div>
                </div>
                <button
                  onClick={() => remove(b._id)}
                  className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

