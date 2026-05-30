import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { FolderPlus, Zap } from 'lucide-react'

function AppShell() {
  const { vaults, activeVaultId } = useApp()
  const activeVault = vaults.find((v) => v.id === activeVaultId) || null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trae-600 text-white shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Liquid</div>
                <div className="text-xs text-slate-500">Ad video MVP demo</div>
              </div>
              {activeVault?.name ? (
                <div className="hidden md:block">
                  <span className="text-xs text-slate-500">Active vault: {activeVault.name}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? 'btn-ghost bg-slate-100 px-3 py-2 text-sm' : 'btn-ghost px-3 py-2 text-sm'
                  }
                >
                  Vaults
                </NavLink>
                {activeVaultId ? (
                  <>
                    <NavLink
                      to={`/vault/${activeVaultId}`}
                      className={({ isActive }) =>
                        isActive ? 'btn-ghost bg-slate-100 px-3 py-2 text-sm' : 'btn-ghost px-3 py-2 text-sm'
                      }
                    >
                      Assets
                    </NavLink>
                    <NavLink
                      to={`/vault/${activeVaultId}/videos`}
                      className={({ isActive }) =>
                        isActive ? 'btn-ghost bg-slate-100 px-3 py-2 text-sm' : 'btn-ghost px-3 py-2 text-sm'
                      }
                    >
                      Videos
                    </NavLink>
                  </>
                ) : null}
              </nav>

              <NavLink to="/vault/new" className="btn-primary">
                <FolderPlus className="h-4 w-4" />
                Create vault
              </NavLink>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
