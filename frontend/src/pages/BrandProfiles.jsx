import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

const fontPresets = ['modern', 'classic', 'bold', 'luxury', 'playful'];
const tonePresets = ['clean', 'bold', 'luxury', 'playful'];

function emptyForm() {
  return {
    name: '',
    logoUrl: '',
    colorPrimary: '#2563eb',
    colorSecondary: '#111827',
    colorAccent: '#f59e0b',
    fontPreset: 'modern',
    tonePreset: 'clean',
  };
}

export default function BrandProfiles() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const editingItem = useMemo(() => items.find((x) => x._id === editingId) || null, [items, editingId]);

  const load = async () => {
    setError('');
    const { data } = await api.get('/brand-profiles');
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
      if (editingId) {
        await api.put(`/brand-profiles/${editingId}`, form);
        setEditingId('');
      } else {
        await api.post('/brand-profiles', form);
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
      name: item.name || '',
      logoUrl: item.logoUrl || '',
      colorPrimary: item.colorPrimary || '#2563eb',
      colorSecondary: item.colorSecondary || '#111827',
      colorAccent: item.colorAccent || '',
      fontPreset: item.fontPreset || 'modern',
      tonePreset: item.tonePreset || 'clean',
    });
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/brand-profiles/${id}`);
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
          <div className="text-xl font-black">Brand Vault</div>
          <div className="text-sm text-gray-600 mt-1">
            Save your logo, colors, and style once. Liquid applies the rulebook to every campaign.
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">{editingItem ? 'Edit Brand Profile' : 'Create Brand Profile'}</div>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Liquid Leather Co."
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Logo URL (transparent preferred)</label>
              <input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="https://..."
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div>
                <label className="text-sm font-medium">Primary</label>
                <input
                  value={form.colorPrimary}
                  onChange={(e) => setForm({ ...form, colorPrimary: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Secondary</label>
                <input
                  value={form.colorSecondary}
                  onChange={(e) => setForm({ ...form, colorSecondary: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Accent</label>
                <input
                  value={form.colorAccent}
                  onChange={(e) => setForm({ ...form, colorAccent: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Font preset</label>
              <select
                value={form.fontPreset}
                onChange={(e) => setForm({ ...form, fontPreset: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {fontPresets.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tone preset</label>
              <select
                value={form.tonePreset}
                onChange={(e) => setForm({ ...form, tonePreset: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {tonePresets.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
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
          <div className="font-bold mb-4">Saved profiles</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No brand profiles yet.</div> : null}
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item._id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.fontPreset} · {item.tonePreset}</div>
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
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-5 h-5 rounded" style={{ background: item.colorPrimary }} />
                  <div className="w-5 h-5 rounded" style={{ background: item.colorSecondary }} />
                  {item.colorAccent ? <div className="w-5 h-5 rounded" style={{ background: item.colorAccent }} /> : null}
                </div>
                <div className="text-xs text-gray-500 mt-3 break-all">{item.logoUrl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

