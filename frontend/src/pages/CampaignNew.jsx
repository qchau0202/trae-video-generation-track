import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { api } from '../api/client';

export default function CampaignNew() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [brandProfiles, setBrandProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [frameworks, setFrameworks] = useState([]);

  const [name, setName] = useState('');
  const [brandProfileId, setBrandProfileId] = useState('');
  const [productInputId, setProductInputId] = useState('');
  const [offerId, setOfferId] = useState('');
  const [frameworkTemplateId, setFrameworkTemplateId] = useState('');

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [b, p, o, f] = await Promise.all([
        api.get('/brand-profiles'),
        api.get('/product-inputs'),
        api.get('/offers'),
        api.get('/framework-templates'),
      ]);
      if (!alive) return;
      setBrandProfiles(b.data.items);
      setProducts(p.data.items);
      setOffers(o.data.items);
      setFrameworks(f.data.items);
      setBrandProfileId(b.data.items[0]?._id || '');
      setProductInputId(p.data.items[0]?._id || '');
      setOfferId(o.data.items[0]?._id || '');
      setFrameworkTemplateId(f.data.items[0]?._id || '');
    };
    load().catch((err) => setError(err?.response?.data?.message || err?.message || 'Failed to load'));
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!name) throw new Error('Campaign name is required');
      const { data } = await api.post('/campaigns', {
        name,
        brandProfileId,
        productInputId,
        offerId,
        frameworkTemplateId,
      });
      navigate(`/campaigns/${data.campaign._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="bg-white border rounded-2xl p-6">
          <div className="text-xl font-black">New campaign</div>
          <div className="text-sm text-gray-600 mt-1">
            Select Brand Vault + Framework + Product + Offer. Then generate variants via PixVerse.
          </div>
        </div>

        <div className="bg-white border rounded-2xl p-6">
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Campaign name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
                placeholder="Payday Mega Sale - Wallets"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Brand profile</label>
              <select
                value={brandProfileId}
                onChange={(e) => setBrandProfileId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {brandProfiles.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name}
                  </option>
                ))}
              </select>
              {brandProfiles.length === 0 ? (
                <div className="text-xs text-gray-500 mt-1">Create one in Brand Vault first.</div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium">Framework</label>
              <select
                value={frameworkTemplateId}
                onChange={(e) => setFrameworkTemplateId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {frameworks.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Product</label>
              <select
                value={productInputId}
                onChange={(e) => setProductInputId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {products.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.title || 'Untitled product'}
                  </option>
                ))}
              </select>
              {products.length === 0 ? (
                <div className="text-xs text-gray-500 mt-1">Create one in Products first.</div>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium">Offer</label>
              <select
                value={offerId}
                onChange={(e) => setOfferId(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2"
              >
                {offers.map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.headlinePolished || x.headlineRaw}
                  </option>
                ))}
              </select>
              {offers.length === 0 ? (
                <div className="text-xs text-gray-500 mt-1">Create one in Offers first.</div>
              ) : null}
            </div>

            {error ? <div className="text-sm text-red-600 md:col-span-2">{error}</div> : null}

            <div className="md:col-span-2">
              <button
                disabled={loading || brandProfiles.length === 0 || products.length === 0 || offers.length === 0}
                className="bg-primary text-white rounded-lg px-4 py-2 font-semibold disabled:opacity-60"
                type="submit"
              >
                {loading ? 'Creating…' : 'Create campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

