import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

function emptyForm() {
  return { headlineRaw: '', headlinePolished: '', ctaText: 'Shop Now', terms: '' };
}

export default function Offers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const editingItem = useMemo(() => items.find((x) => x._id === editingId) || null, [items, editingId]);

  const load = async () => {
    const { data } = await api.get('/offers');
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      if (editingId) {
        await api.put(`/offers/${editingId}`, payload);
        setEditingId('');
      } else {
        await api.post('/offers', payload);
      }
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      headlineRaw: item.headlineRaw || '',
      headlinePolished: item.headlinePolished || '',
      ctaText: item.ctaText || 'Shop Now',
      terms: item.terms || '',
    });
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/offers/${id}`);
      if (editingId === id) {
        setEditingId('');
        setForm(emptyForm());
      }
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">Offers</div>
          <div className="text-sm text-gray-600 mt-1">
            Paste a raw offer line. Liquid auto-polishes it into mobile-safe ad text.
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">{editingItem ? 'Edit Offer' : 'Create Offer'}</div>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Raw headline</label>
              <input
                value={form.headlineRaw}
                onChange={(e) => setForm({ ...form, headlineRaw: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder='Get 20% off our leather wallets this weekend'
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Polished headline (optional)</label>
              <input
                value={form.headlinePolished}
                onChange={(e) => setForm({ ...form, headlinePolished: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Leave blank to auto-polish"
              />
            </div>
            <div>
              <label className="text-sm font-medium">CTA</label>
              <input
                value={form.ctaText}
                onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Terms (optional)</label>
              <input
                value={form.terms}
                onChange={(e) => setForm({ ...form, terms: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Ends Sunday"
              />
            </div>

            {error ? <div className="text-sm text-red-600 md:col-span-2">{error}</div> : null}

            <div className="md:col-span-2 flex items-center gap-3">
              <button
                disabled={loading}
                className="bg-primary text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                type="submit"
              >
                {loading ? 'Saving…' : editingItem ? 'Update' : 'Create'}
              </button>
              {editingItem ? (
                <button
                  type="button"
                  className="border rounded-lg px-4 py-2 font-semibold hover:bg-gray-50"
                  onClick={() => {
                    setEditingId('');
                    setForm(emptyForm());
                  }}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Saved offers</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No offers yet.</div> : null}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold break-words">{item.headlinePolished || item.headlineRaw}</div>
                  <div className="text-xs text-gray-500 mt-1">CTA: {item.ctaText || 'Shop Now'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(item._id)}
                    className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

