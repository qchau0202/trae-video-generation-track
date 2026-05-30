import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/AppShell';
import { api } from '../api/client';
import { getSession } from '../lib/session';

const goalTypes = ['hook-splitter', 'mega-sale', 'feature-benefit'];

function emptyForm() {
  return {
    name: '',
    goalType: 'hook-splitter',
    supportedFormats: { '9:16': true, '1:1': true },
    minDurationSeconds: 30,
  };
}

export default function FrameworkTemplates() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const session = getSession();
  const canEdit = session?.workspace?.role === 'owner' || session?.workspace?.role === 'admin';

  const editingItem = useMemo(() => items.find((x) => x._id === editingId) || null, [items, editingId]);

  const load = async () => {
    const { data } = await api.get('/framework-templates');
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
      const supportedFormats = Object.entries(form.supportedFormats)
        .filter(([, v]) => Boolean(v))
        .map(([k]) => k);
      const payload = {
        name: form.name,
        goalType: form.goalType,
        supportedFormats,
        minDurationSeconds: Number(form.minDurationSeconds || 30),
        slotSchema: [],
      };

      if (editingId) {
        await api.put(`/framework-templates/${editingId}`, payload);
        setEditingId('');
      } else {
        await api.post('/framework-templates', payload);
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
      goalType: item.goalType || 'hook-splitter',
      supportedFormats: {
        '9:16': Array.isArray(item.supportedFormats) ? item.supportedFormats.includes('9:16') : true,
        '1:1': Array.isArray(item.supportedFormats) ? item.supportedFormats.includes('1:1') : true,
      },
      minDurationSeconds: item.minDurationSeconds || 30,
    });
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/framework-templates/${id}`);
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
          <div className="text-xl font-black">Conversion Frameworks</div>
          <div className="text-sm text-gray-600 mt-1">
            Pre-engineered layouts and pacing. Merchants pick a goal instead of staring at a blank timeline.
          </div>
        </div>

        {canEdit ? (
          <div className="bg-white border rounded-2xl p-6">
            <div className="font-bold mb-4">{editingItem ? 'Edit Framework' : 'Create Framework'}</div>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="My Custom Framework"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Goal type</label>
                <select
                  value={form.goalType}
                  onChange={(e) => setForm({ ...form, goalType: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                >
                  {goalTypes.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Min duration (seconds)</label>
                <input
                  value={form.minDurationSeconds}
                  onChange={(e) => setForm({ ...form, minDurationSeconds: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="30"
                />
              </div>

              <div className="md:col-span-2">
                <div className="text-sm font-medium">Formats</div>
                <div className="flex items-center gap-4 mt-2">
                  {['9:16', '1:1'].map((fmt) => (
                    <label key={fmt} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(form.supportedFormats[fmt])}
                        onChange={(e) =>
                          setForm({ ...form, supportedFormats: { ...form.supportedFormats, [fmt]: e.target.checked } })
                        }
                      />
                      {fmt}
                    </label>
                  ))}
                </div>
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
        ) : null}

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold mb-4">Library</div>
          {items.length === 0 ? <div className="text-sm text-gray-600">No frameworks found.</div> : null}
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item._id} className="border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.goalType} · min {item.minDurationSeconds || 30}s ·{' '}
                      {Array.isArray(item.supportedFormats) ? item.supportedFormats.join(', ') : ''}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{item.isSystem ? 'System template' : 'Custom'}</div>
                  </div>
                  {canEdit && !item.isSystem ? (
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
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

