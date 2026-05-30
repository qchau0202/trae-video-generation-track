import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/useApp'
import Dropzone from '../components/Dropzone'
import { ArrowRight, ChevronRight, FolderPlus, ImagePlus, X } from 'lucide-react'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hexToRgb(hex) {
  const cleaned = String(hex || '').replace('#', '').trim()
  if (cleaned.length !== 6) return null
  const num = Number.parseInt(cleaned, 16)
  if (Number.isNaN(num)) return null
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return { r, g, b }
}

function mixRgb(a, b, t) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)))
  return {
    r: clamp(a.r + (b.r - a.r) * t),
    g: clamp(a.g + (b.g - a.g) * t),
    b: clamp(a.b + (b.b - a.b) * t),
  }
}

async function extractAverageColorHex(dataUrl) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = dataUrl
  })

  const canvas = document.createElement('canvas')
  const size = 48
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(img, 0, 0, size, size)

  const { data } = ctx.getImageData(0, 0, size, size)
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3]
    if (a < 16) continue
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    count += 1
  }
  if (!count) return '#863bff'
  return rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count))
}

function looksBinary(text) {
  const sample = text.slice(0, 2000)
  let weird = 0
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i)
    if (code === 0) return true
    if (code < 9) weird++
  }
  return weird > 2
}

function Vault() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { vaults, createVault, updateVault, setActiveVaultId } = useApp()
  const vault = vaults.find((v) => v.id === id) || null

  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')

  const palette = vault?.colors || { primary: '#863bff', secondary: '#0f172a', accent: '#7e14ff' }

  const handleLogoFiles = async (files) => {
    const file = files?.[0]
    if (!file) return
    try {
      const dataUrl = await readFileAsDataUrl(file)
      const primary = await extractAverageColorHex(dataUrl)
      const rgb = hexToRgb(primary) || { r: 134, g: 59, b: 255 }
      const secondary = rgbToHex(...Object.values(mixRgb(rgb, { r: 15, g: 23, b: 42 }, 0.75)))
      const accent = rgbToHex(...Object.values(mixRgb(rgb, { r: 255, g: 255, b: 255 }, 0.2)))
      updateVault(id, { logoUrl: dataUrl, colors: { primary, secondary, accent } })
    } catch {
      setError('Could not read that file. Try a smaller PNG/JPG.')
    }
  }

  const handleProductImages = async (files) => {
    if (!vault) return
    if (!files || files.length === 0) return
    const existing = vault.productImages || []
    const max = 30
    const remaining = Math.max(0, max - existing.length)
    if (remaining === 0) {
      setError('Too many images for this demo session.')
      return
    }
    try {
      const sliced = files.slice(0, remaining)
      const urls = await Promise.all(sliced.map(readFileAsDataUrl))
      updateVault(vault.id, { productImages: [...existing, ...urls] })
      setError('')
    } catch {
      setError('Could not read one of the images. Try smaller PNG/JPG files.')
    }
  }

  const removeProductImage = (idx) => {
    if (!vault) return
    const existing = vault.productImages || []
    updateVault(vault.id, { productImages: existing.filter((_, i) => i !== idx) })
  }

  const handleBrandDocs = async (files) => {
    if (!vault) return
    if (!files || files.length === 0) return
    const max = 3
    const existing = vault.brandDocs || []
    const remaining = Math.max(0, max - existing.length)
    if (remaining === 0) {
      setError('Max 3 files for the demo.')
      return
    }

    const sliced = files.slice(0, remaining)
    const docs = []
    for (const file of sliced) {
      try {
        const raw = await readFileAsText(file)
        const text = looksBinary(raw) ? '' : raw.slice(0, 8000)
        docs.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          text,
          createdAt: new Date().toISOString(),
        })
      } catch {
        docs.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          text: '',
          createdAt: new Date().toISOString(),
        })
      }
    }
    updateVault(vault.id, { brandDocs: [...existing, ...docs] })
    setError('')
  }

  const removeBrandDoc = (docId) => {
    if (!vault) return
    updateVault(vault.id, { brandDocs: (vault.brandDocs || []).filter((d) => d.id !== docId) })
  }

  const onCreate = (e) => {
    e.preventDefault()
    const name = (createForm.name || '').trim()
    if (!name) {
      setError('Vault name is required.')
      return
    }
    const created = createVault({ name, description: (createForm.description || '').trim() })
    setActiveVaultId(created.id)
    navigate(`/vault/${created.id}`)
  }

  const isCreate = !id

  if (isCreate) {
    return (
      <div className="page">
        <div className="card">
          <div className="card-header">
            <h1 className="title">Create vault</h1>
            <div className="subtitle">Name + description only. Upload assets and generate versions inside it.</div>
          </div>
          <div className="card-body">
            <form onSubmit={onCreate} className="space-y-4">
              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-trae-100 text-trae-700">
                  <FolderPlus className="h-5 w-5" />
                </div>
                <div className="text-sm text-slate-700">
                  Quick demo setup. Default category is F&amp;B, product type is soy milk drinks (editable later).
                </div>
              </div>
              <div>
                <label className="label">Vault name</label>
                <input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  className="input"
                  placeholder="e.g., SoyJoy Milk"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="textarea"
                  placeholder="Optional notes for your brand"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  Create vault
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (!vault) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-sm font-semibold text-slate-900">Vault not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <button type="button" onClick={() => navigate('/')} className="hover:text-slate-700">
                  Vaults
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-700">{vault.name}</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {vault.logoUrl ? (
                    <img src={vault.logoUrl} alt={`${vault.name} logo`} className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-50 text-sm font-semibold text-slate-500">
                      {(vault.name || 'V').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-semibold text-slate-900">{vault.name}</h1>
              </div>
              <div className="subtitle">{vault.description || 'No description'}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate('/')} className="btn-secondary">
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveVaultId(vault.id)
                  navigate(`/vault/${vault.id}/videos`)
                }}
                className="btn-primary"
              >
                Open video studio
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-900">Step 1 — Assets</div>
              <div className="subtitle">Upload logo + product images. Logo auto-extracts a palette (editable).</div>
            </div>
            <div className="card-body">
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                {vault.logoUrl ? (
                  <div>
                    <div className="mb-2 text-sm font-medium text-slate-700">Logo</div>
                    <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img src={vault.logoUrl} alt="Logo" className="h-44 w-44 object-contain" />
                      <button
                        type="button"
                        onClick={() => updateVault(vault.id, { logoUrl: null })}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">Palette auto-extracted from logo. You can edit it.</div>
                  </div>
                ) : (
                  <Dropzone
                    label="Upload logo"
                    hint="PNG/JPG"
                    accept="image/png,image/jpeg"
                    onFiles={handleLogoFiles}
                  />
                )}
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-700">Product images</div>
                <Dropzone
                  label=""
                  hint="No strict limit (demo usually uses 1 product)"
                  accept="image/png,image/jpeg"
                  multiple
                  onFiles={handleProductImages}
                />
                {(vault.productImages || []).length ? (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {vault.productImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => removeProductImage(idx)}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                        title="Remove"
                      >
                        <img src={img} alt={`Product ${idx + 1}`} className="h-24 w-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    Upload product images to help the model stay on-brand and on-product.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Category</label>
                <select
                  value={vault.productCategory || 'F&B'}
                  onChange={(e) => updateVault(vault.id, { productCategory: e.target.value })}
                  className="select"
                >
                  <option>F&B</option>
                  <option>Beauty</option>
                  <option>Fashion</option>
                  <option>Home</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Product type</label>
                <input
                  value={vault.productType || ''}
                  onChange={(e) => updateVault(vault.id, { productType: e.target.value })}
                  className="input"
                  placeholder="Soy milk drinks"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-900">Optional: brand files</div>
              <div className="subtitle">Upload .txt/.doc style content. We try to extract text.</div>
            </div>
            <div className="card-body">
              <Dropzone
                label=""
                hint="Upload .txt or any text-like file"
                accept=".txt,.md,.csv,.doc,.docx,text/plain"
                multiple
                onFiles={handleBrandDocs}
              />
            {(vault.brandDocs || []).length ? (
              <div className="mt-4 space-y-2">
                {vault.brandDocs.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-900">{d.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{d.text ? 'Text extracted' : 'File attached (no text extracted)'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBrandDoc(d.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Optional: upload brand guidelines, messaging, or product notes. Liquid will reference them when generating prompts.
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card lg:sticky lg:top-24">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-900">Palette</div>
              <div className="subtitle">Auto-extracted from logo, editable.</div>
            </div>
            <div className="card-body space-y-3">
              {[
                { key: 'primary', label: 'Primary' },
                { key: 'secondary', label: 'Secondary' },
                { key: 'accent', label: 'Accent' },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-slate-600">{item.label}</div>
                  <input
                    type="color"
                    value={palette[item.key] || '#000000'}
                    onChange={(e) => updateVault(vault.id, { colors: { ...palette, [item.key]: e.target.value } })}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                  />
                  <input
                    value={palette[item.key] || ''}
                    onChange={(e) => updateVault(vault.id, { colors: { ...palette, [item.key]: e.target.value } })}
                    className="input flex-1 font-mono"
                    placeholder="#HEX"
                  />
                </div>
              ))}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ background: palette.primary }}>
                    Primary
                  </span>
                  <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ background: palette.secondary }}>
                    Secondary
                  </span>
                  <span className="rounded-full px-3 py-1 text-sm font-medium text-white" style={{ background: palette.accent }}>
                    Accent
                  </span>
                </div>
              </div>
            <div className="divider my-5" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Step 2 — Versions</div>
                <div className="mt-1 text-sm text-slate-600">Create versions and confirm generation.</div>
              </div>
              <ImagePlus className="h-5 w-5 text-slate-500" />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveVaultId(vault.id)
                  navigate(`/vault/${vault.id}/videos`)
                }}
                className="btn-primary w-full"
              >
                Open video studio
              </button>
            </div>
          </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Vault
