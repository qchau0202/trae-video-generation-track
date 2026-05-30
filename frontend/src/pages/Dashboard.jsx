import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, FolderPlus, Zap } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const { vaults, setActiveVaultId } = useApp()

  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-trae-100 px-4 py-2 text-sm font-medium text-trae-700">
                <Zap className="h-4 w-4" />
                Quick MVP demo
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">Brand Vaults</h1>
              <p className="mt-2 text-sm text-slate-600">
                Pick a vault, upload assets, then generate ad video versions.
              </p>
            </div>
            <button type="button" onClick={() => navigate('/vault/new')} className="btn-primary">
              <FolderPlus className="h-4 w-4" />
              Create vault
            </button>
          </div>
        </div>
      </div>

      {vaults.length === 0 ? (
        <div className="card">
          <div className="card-body text-center">
            <div className="text-sm font-semibold text-slate-900">No vaults yet</div>
            <div className="mt-2 text-sm text-slate-600">Create one to start generating ad videos.</div>
            <div className="mt-6">
              <button type="button" onClick={() => navigate('/vault/new')} className="btn-primary">
                Create your first vault
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
            {vaults.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setActiveVaultId(v.id)
                  navigate(`/vault/${v.id}`)
                }}
                className="card text-left hover:bg-slate-50"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold text-slate-900">{v.name || 'Untitled vault'}</div>
                      <div className="mt-1 line-clamp-2 text-sm text-slate-600">{v.description || 'No description'}</div>
                    </div>
                    <div className="badge-slate">{v.productCategory || '—'}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="badge-slate">{(v.productImages || []).length} images</span>
                    <span className="badge-slate">{v.productType || '—'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="card lg:sticky lg:top-24">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-900">Demo flow</div>
              <div className="subtitle">No auth. One vault → many versions.</div>
            </div>
            <div className="card-body space-y-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-medium">1) Create a vault</div>
                <div className="mt-1 text-slate-600">Name + description.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-medium">2) Upload assets</div>
                <div className="mt-1 text-slate-600">Logo → palette, add product images.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-medium">3) Create versions</div>
                <div className="mt-1 text-slate-600">Idea → create version → edit anything.</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="font-medium">4) Confirm & generate</div>
                <div className="mt-1 text-slate-600">PixVerse V6 job → preview → regenerate.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
