import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { ArrowRight, Sparkles } from 'lucide-react'

function Frameworks() {
  const navigate = useNavigate()
  const { frameworks } = useApp()

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Framework Library</h1>
            <p className="mt-1 text-sm text-slate-600">
              Pick a conversion framework. Liquid uses it to guarantee pacing and brand-safe structure.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-trae-100 px-4 py-2 text-sm font-medium text-trae-700">
            <Sparkles className="h-4 w-4" />
            Guardrailed templates
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {frameworks.map((fw) => (
          <div key={fw.id} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">{fw.name}</div>
            <div className="mt-2 text-sm text-slate-600">{fw.description}</div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Outputs</div>
                <div className="font-medium">{fw.hooks.length} variant{fw.hooks.length === 1 ? '' : 's'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Formats</div>
                <div className="font-medium">{fw.supportedFormats.join(' • ')}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-slate-500">Min duration</div>
                <div className="font-medium">{fw.minDurationSec}s</div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {fw.hooks.map((h) => (
                <span key={h.type} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {h.label}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate(`/campaign/new?framework=${encodeURIComponent(fw.id)}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-trae-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-trae-700"
              >
                Use this framework
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Frameworks
