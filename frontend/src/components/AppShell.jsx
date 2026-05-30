import { NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { Zap } from 'lucide-react'

const navItemBase = 'rounded-lg px-3 py-2 text-sm font-medium transition-colors'

function AppShell() {
  const { vaults, activeVaultId } = useApp()
  const activeVault = vaults.find((v) => v.id === activeVaultId) || null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-trae-600 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Liquid</div>
                <div className="text-xs text-slate-500">
                  {activeVault?.name ? activeVault.name : 'Ad video demo'}
                </div>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `${navItemBase} bg-trae-100 text-trae-700`
                    : `${navItemBase} text-slate-700 hover:bg-slate-100`
                }
              >
                Vaults
              </NavLink>
              {activeVaultId ? (
                <>
                  <NavLink
                    to={`/vault/${activeVaultId}`}
                    className={({ isActive }) =>
                      isActive
                        ? `${navItemBase} bg-trae-100 text-trae-700`
                        : `${navItemBase} text-slate-700 hover:bg-slate-100`
                    }
                  >
                    Vault
                  </NavLink>
                  <NavLink
                    to={`/vault/${activeVaultId}/videos`}
                    className={({ isActive }) =>
                      isActive
                        ? `${navItemBase} bg-trae-100 text-trae-700`
                        : `${navItemBase} text-slate-700 hover:bg-slate-100`
                    }
                  >
                    Videos
                  </NavLink>
                </>
              ) : null}
            </nav>
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
