import React, { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function ShareLinks() {
  const [items, setItems] = useState([]);
  const [campaignId, setCampaignId] = useState('');
  const [variantId, setVariantId] = useState('');
  const [permissions, setPermissions] = useState({ view: true, comment: true, vote: true });
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/share-links');
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  const create = async () => {
    setError('');
    try {
      const perms = Object.entries(permissions)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k);
      const payload = {
        campaignId: campaignId || null,
        variantId: variantId || null,
        permissions: perms,
      };
      const { data } = await api.post('/share-links', payload);
      setItems([data.item, ...items]);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Create failed');
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/share-links/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Share Links</div>
          <div className="text-sm text-gray-600 mt-1">Create public review links for campaigns or variants.</div>
        </div>

        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div className="font-bold">Create link</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Campaign ID (optional)</label>
              <input
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Mongo id"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Variant ID (optional)</label>
              <input
                value={variantId}
                onChange={(e) => setVariantId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Mongo id"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {['view', 'comment', 'vote'].map((p) => (
              <label key={p} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(permissions[p])}
                  onChange={(e) => setPermissions({ ...permissions, [p]: e.target.checked })}
                />
                {p}
              </label>
            ))}
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button onClick={create} className="bg-primary text-white rounded-lg px-4 py-2 font-semibold" type="button">
            Create share link
          </button>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Links</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No links yet.</div> : null}
          <div className="space-y-2">
            {items.map((x) => {
              const url = `${window.location.origin}/share/${x.token}`;
              return (
                <div key={x._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold break-all">{url}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      perms: {Array.isArray(x.permissions) ? x.permissions.join(', ') : 'view'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {x.campaignId ? `campaign: ${x.campaignId}` : ''} {x.variantId ? `variant: ${x.variantId}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(x._id)}
                    className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

