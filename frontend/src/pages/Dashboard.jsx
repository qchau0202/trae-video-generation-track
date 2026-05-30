import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({ campaigns: 0, brandProfiles: 0, frameworks: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [campaigns, brandProfiles, frameworks] = await Promise.all([
          api.get('/campaigns'),
          api.get('/brand-profiles'),
          api.get('/framework-templates'),
        ]);
        if (!alive) return;
        setStats({
          campaigns: campaigns.data.items.length,
          brandProfiles: brandProfiles.data.items.length,
          frameworks: frameworks.data.items.length,
        });
      } catch (err) {
        if (!alive) return;
        setError(err?.response?.data?.message || err?.message || 'Failed to load');
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-2xl font-black">Campaign appliance</div>
          <div className="text-gray-600 mt-2">
            Brand Vault → Framework → Assets → Generate (PixVerse) → Compare → Feedback → Export
          </div>
          {error ? <div className="text-sm text-red-600 mt-3">{error}</div> : null}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-sm text-gray-500">Brand Profiles</div>
            <div className="text-3xl font-black mt-1">{stats.brandProfiles}</div>
            <Link to="/brand-vault" className="text-primary font-semibold text-sm mt-3 inline-block">
              Manage
            </Link>
          </div>
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-sm text-gray-500">Frameworks</div>
            <div className="text-3xl font-black mt-1">{stats.frameworks}</div>
            <Link to="/frameworks" className="text-primary font-semibold text-sm mt-3 inline-block">
              Browse
            </Link>
          </div>
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-sm text-gray-500">Campaigns</div>
            <div className="text-3xl font-black mt-1">{stats.campaigns}</div>
            <Link to="/campaigns" className="text-primary font-semibold text-sm mt-3 inline-block">
              View
            </Link>
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <div className="font-bold">Quick start</div>
          <ol className="list-decimal pl-5 mt-2 text-sm text-gray-700 space-y-1">
            <li>Create a Brand Profile in Brand Vault</li>
            <li>Create a Product and an Offer</li>
            <li>Create a Campaign and click Generate</li>
          </ol>
        </div>
      </div>
    </AppShell>
  );
}

