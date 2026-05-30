import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

function emptyForm() {
  return {
    sourceType: 'upload',
    sourceUrl: '',
    title: '',
    imagesText: '',
    price: '',
    currency: 'USD',
  };
}

function parseImages(imagesText) {
  return String(imagesText || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProductInputs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const editingItem = useMemo(() => items.find((x) => x._id === editingId) || null, [items, editingId]);

  const load = async () => {
    const { data } = await api.get('/product-inputs');
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
      const payload = {
        sourceType: form.sourceType,
        sourceUrl: form.sourceType === 'url' ? form.sourceUrl : '',
        title: form.title,
        images: parseImages(form.imagesText),
        price: form.price === '' ? null : Number(form.price),
        currency: form.currency,
      };

      if (payload.images.length === 0) {
        throw new Error('At least 1 image URL is required');
      }

      if (editingId) {
        await api.put(`/product-inputs/${editingId}`, payload);
        setEditingId('');
      } else {
        await api.post('/product-inputs', payload);
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
      sourceType: item.sourceType || 'upload',
      sourceUrl: item.sourceUrl || '',
      title: item.title || '',
      imagesText: Array.isArray(item.images) ? item.images.join('\n') : '',
      price: item.price === null || item.price === undefined ? '' : String(item.price),
      currency: item.currency || 'USD',
    });
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/product-inputs/${id}`);
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
          <div className="text-xl font-black">Products</div>
          <div className="text-sm text-gray-600 mt-1">
            Provide a product URL or upload image URLs. Liquid uses these assets inside the campaign framework.
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">{editingItem ? 'Edit Product' : 'Create Product'}</div>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Source type</label>
              <select
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                <option value="upload">Upload (URLs)</option>
                <option value="url">Listing URL</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Listing URL</label>
              <input
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="https://..."
                disabled={form.sourceType !== 'url'}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Leather wallet"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Image URLs (one per line)</label>
              <textarea
                value={form.imagesText}
                onChange={(e) => setForm({ ...form, imagesText: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2 min-h-28"
                placeholder="https://...\nhttps://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price</label>
              <input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="49.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="USD"
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
          <div className="font-bold mb-4">Saved products</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No products yet.</div> : null}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold truncate">{item.title || 'Untitled product'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {item.sourceType} {item.sourceUrl ? `· ${item.sourceUrl}` : ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {Array.isArray(item.images) ? `${item.images.length} images` : '0 images'}
                    {item.price ? ` · ${item.currency || 'USD'} ${item.price}` : ''}
                  </div>
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

