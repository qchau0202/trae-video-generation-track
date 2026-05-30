import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api/client';
import { setSession } from '../lib/session';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('My Workspace');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const payload =
        mode === 'register'
          ? { email, password, displayName, workspaceName }
          : { email, password };
      const { data } = await publicApi.post(path, payload);
      setSession(data);
      navigate('/');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-2xl font-black">Liquid</div>
            <div className="text-sm text-gray-500">Guardrailed ad creative for e-commerce</div>
          </div>
          <button
            className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
            type="button"
          >
            {mode === 'register' ? 'Login' : 'Register'}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' ? (
            <>
              <div>
                <label className="text-sm font-medium">Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Workspace name</label>
                <input
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  placeholder="Liquid Store"
                />
              </div>
            </>
          ) : null}

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="you@shop.com"
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2"
              placeholder="********"
              type="password"
              required
            />
            {mode === 'register' ? (
              <div className="text-xs text-gray-500 mt-1">Minimum 8 characters</div>
            ) : null}
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <button
            disabled={loading}
            className="w-full bg-primary text-white rounded-lg px-3 py-2 font-semibold disabled:opacity-60"
            type="submit"
          >
            {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

