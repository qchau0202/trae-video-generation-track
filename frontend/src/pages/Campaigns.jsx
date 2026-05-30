import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

function statusBadge(status) {
  const map = {
    draft: 'bg-gray-100 text-gray-700',
    generating: 'bg-blue-100 text-blue-700',
    ready: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    archived: 'bg-gray-100 text-gray-600',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export default function Campaigns() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/campaigns');
    setItems(data.items);
  };

  useEffect(() => {
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
  }, []);

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/campaigns/${id}`);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Delete failed');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-xl font-black">Campaigns</div>
            <div className="text-sm text-gray-600 mt-1">Create campaigns, generate variants, compare, export.</div>
          </div>
          <Link
            to="/campaigns/new"
            className="bg-primary text-white rounded-lg px-4 py-2 font-semibold"
          >
            New campaign
          </Link>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="bg-white border rounded-2xl p-6">
          {items.length === 0 ? <div className="text-sm text-gray-600">No campaigns yet.</div> : null}
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c._id} className="border rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/campaigns/${c._id}`} className="font-bold hover:text-primary">
                      {c.name}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Created {new Date(c.createdAt).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => remove(c._id)}
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

