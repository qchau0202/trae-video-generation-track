import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, LogOut } from 'lucide-react';
import { clearSession, getSession } from '../lib/session';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/brand-vault', label: 'Brand Vault' },
  { to: '/products', label: 'Products' },
  { to: '/offers', label: 'Offers' },
  { to: '/frameworks', label: 'Frameworks' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/share-links', label: 'Share Links' },
  { to: '/exports', label: 'Exports' },
  { to: '/variants', label: 'Variants' },
  { to: '/video-assets', label: 'Video Assets' },
  { to: '/jobs', label: 'Jobs' },
];

function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const session = getSession();

  const onLogout = () => {
    clearSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary fill-current" />
            <div className="font-black tracking-tight">Liquid</div>
            <div className="text-xs text-gray-500">
              {session?.workspace?.name ? `Workspace: ${session.workspace.name}` : ''}
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="bg-white border rounded-xl p-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    'block px-3 py-2 rounded-lg text-sm font-medium',
                    isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}

