import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, FolderPlus, Zap } from 'lucide-react'

function Dashboard() {
  const navigate = useNavigate()
  const { vaults, setActiveVaultId } = useApp()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-trae-100 px-4 py-2 text-sm font-medium text-trae-700">
              <Zap className="h-4 w-4" />
              Ad video demo
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Brand Vaults</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create a vault once, upload your brand + product assets, then generate versions of ad videos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/vault/new')}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-trae-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-trae-700"
          >
            <FolderPlus className="h-4 w-4" />
            Create vault
          </button>
        </div>
      </div>

      {vaults.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <div className="text-sm font-semibold">No vaults yet</div>
          <div className="mt-2 text-sm text-slate-600">Create one to start generating ad videos.</div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/vault/new')}
              className="inline-flex items-center gap-2 rounded-lg bg-trae-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-trae-700"
            >
              Create your first vault
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vaults.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                setActiveVaultId(v.id)
                navigate(`/vault/${v.id}`)
              }}
              className="text-left rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold">{v.name || 'Untitled vault'}</div>
                  <div className="mt-1 line-clamp-2 text-sm text-slate-600">{v.description || 'No description'}</div>
                </div>
                <div className="text-xs font-medium text-slate-500">{v.productCategory || '—'}</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">{(v.productImages || []).length} images</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{v.productType || '—'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
