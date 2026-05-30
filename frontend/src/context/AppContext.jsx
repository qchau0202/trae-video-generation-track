import { useEffect, useState } from 'react'
import { LiquidContext } from './liquidContext'

const STORAGE_KEYS = {
  LEGACY_VAULT: 'liquid_vault',
  LEGACY_CAMPAIGNS: 'liquid_campaigns_v2',
  VAULTS: 'liquid_vaults_v1',
  VIDEOS: 'liquid_videos_v1',
  ACTIVE_VAULT_ID: 'liquid_active_vault_id_v1',
}

const SAMPLE_VIDEO_URL = 'https://res.cloudinary.com/demo/video/upload/v1631020211/sample_video.mp4'

const generateId = () => Math.random().toString(36).slice(2, 10)

const nowIso = () => new Date().toISOString()

const defaultVault = {
  id: null,
  name: '',
  description: '',
  logoUrl: null,
  colors: {
    primary: '#863bff',
    secondary: '#0f172a',
    accent: '#7e14ff',
  },
  productCategory: 'F&B',
  productType: 'Soy milk drinks',
  productImages: [],
  brandDocs: [],
  createdAt: null,
  updatedAt: null,
}

function clampText(text, maxLen) {
  const trimmed = (text || '').trim()
  if (trimmed.length <= maxLen) return trimmed
  return trimmed.slice(0, maxLen).trimEnd()
}

function buildVideoAssets({ durationSec }) {
  return [
    {
      id: generateId(),
      format: '9:16',
      durationSec,
      url: SAMPLE_VIDEO_URL,
      captionsBurned: false,
    },
  ]
}

function buildAutoPrompt({ vault, video }) {
  const duration = Number.isFinite(video?.generation?.durationSec) ? video.generation.durationSec : 30
  const aspectRatio = video?.generation?.aspectRatio || '9:16'
  const category = vault?.productCategory ? `Category: ${vault.productCategory}.` : ''
  const productType = vault?.productType ? `Product type: ${vault.productType}.` : ''
  const idea = clampText(video?.ideaText, 1200)
  const colors = vault?.colors
    ? `${vault.colors.primary}, ${vault.colors.secondary}, ${vault.colors.accent}`
    : ''
  const hasLogo = Boolean(vault?.logoUrl)
  const imageCount = (vault?.productImages || []).length
  const cta = video?.generation?.ctaText ? `CTA: ${video.generation.ctaText}.` : ''
  const pieces = [
    `Create a ${duration}s ${aspectRatio} performance ad video optimized for paid social.`,
    'Structure: hook (0–2s) → product showcase → benefit/proof → offer → CTA.',
    category,
    productType,
    idea ? `Idea: ${idea}` : '',
    imageCount ? `Use the provided product images as reference (${imageCount} images).` : '',
    hasLogo ? 'Include the brand logo subtly (corner watermark), do not distort it.' : '',
    colors ? `Brand colors: ${colors}.` : '',
    cta,
    'Use clean typography, minimal on-screen text, and strong product focus.',
    'Keep safe margins (no important text near edges). Avoid warped logos and off-brand colors.',
  ].filter(Boolean)
  return pieces.join(' ')
}

export function AppProvider({ children }) {
  const [vaults, setVaults] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VAULTS)
    if (saved) return JSON.parse(saved)

    const legacyVault = localStorage.getItem(STORAGE_KEYS.LEGACY_VAULT)
    if (legacyVault) {
      const parsed = JSON.parse(legacyVault)
      const migrated = {
        ...defaultVault,
        id: generateId(),
        name: parsed.vaultName || 'Brand Vault',
        description: parsed.vaultDescription || '',
        logoUrl: parsed.logoUrl || null,
        colors: {
          ...defaultVault.colors,
          primary: parsed.colors?.[0] || defaultVault.colors.primary,
        },
        createdAt: parsed.createdAt || nowIso(),
        updatedAt: nowIso(),
      }
      return [migrated]
    }

    const legacyBrand = localStorage.getItem('liquid_brand_profile')
    if (legacyBrand) {
      const parsed = JSON.parse(legacyBrand)
      const migrated = {
        ...defaultVault,
        id: parsed.id || generateId(),
        name: parsed.vaultName || parsed.name || 'Brand Vault',
        description: parsed.vaultDescription || parsed.description || '',
        logoUrl: parsed.logoUrl || null,
        colors: parsed.colors || defaultVault.colors,
        createdAt: parsed.createdAt || nowIso(),
        updatedAt: nowIso(),
      }
      return [migrated]
    }

    return []
  })

  const [activeVaultId, setActiveVaultId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VAULT_ID)
    if (saved) return saved
    return null
  })

  const [videos, setVideos] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIDEOS)
    if (saved) return JSON.parse(saved)

    const legacyCampaigns = localStorage.getItem(STORAGE_KEYS.LEGACY_CAMPAIGNS)
    if (!legacyCampaigns) return []
    try {
      const parsed = JSON.parse(legacyCampaigns)
      if (!Array.isArray(parsed)) return []
      return parsed.map((c) => ({
        id: c.id || generateId(),
        vaultId: null,
        status: c.status || 'draft',
        createdAt: c.createdAt || nowIso(),
        updatedAt: c.updatedAt || c.createdAt || nowIso(),
        ideaText: c.offer?.headlinePolished || c.offer?.headlineRaw || '',
        ideaAttachment: null,
        generation: {
          model: c.generation?.model || 'PixVerse V6',
          aspectRatio: c.generation?.aspectRatio || '9:16',
          durationSec: Number.isFinite(c.generation?.durationSec) ? c.generation.durationSec : 30,
          ctaText: c.offer?.ctaText || 'Shop Now',
          prompt: c.generation?.prompt || '',
          negativePrompt: c.generation?.negativePrompt || '',
        },
        job: null,
        videoAssets: c.variants?.[0]?.videoAssets || [],
      }))
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VAULTS, JSON.stringify(vaults))
  }, [vaults])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos))
  }, [videos])

  useEffect(() => {
    if (activeVaultId) localStorage.setItem(STORAGE_KEYS.ACTIVE_VAULT_ID, activeVaultId)
  }, [activeVaultId])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      setVideos((prev) => {
        let changed = false
        const next = prev.map((v) => {
          if (v.status !== 'generating') return v
          const startedAt = v.job?.startedAt || 0
          const etaMs = v.job?.etaMs || 0
          if (!startedAt || !etaMs) return v
          if (now < startedAt + etaMs) return v
          changed = true
          const durationSec = Number.isFinite(v.generation?.durationSec) ? v.generation.durationSec : 30
          return {
            ...v,
            status: 'ready',
            updatedAt: nowIso(),
            job: { ...v.job, status: 'done', finishedAt: nowIso() },
            videoAssets: v.videoAssets?.length ? v.videoAssets : buildVideoAssets({ durationSec }),
          }
        })
        return changed ? next : prev
      })
    }, 900)

    return () => clearInterval(intervalId)
  }, [])

  const createVault = ({ name, description }) => {
    const vault = {
      ...defaultVault,
      id: generateId(),
      name: clampText(name, 60),
      description: clampText(description, 240),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    setVaults((prev) => [vault, ...prev])
    setActiveVaultId(vault.id)
    return vault
  }

  const updateVault = (vaultId, updates) => {
    setVaults((prev) =>
      prev.map((v) =>
        v.id === vaultId
          ? {
              ...v,
              ...updates,
              colors: updates.colors ? { ...v.colors, ...updates.colors } : v.colors,
              updatedAt: nowIso(),
            }
          : v
      )
    )
  }

  const createVideoVersion = (vaultId, payload) => {
    const vault = vaults.find((v) => v.id === vaultId) || null
    const generation = {
      model: 'PixVerse V6',
      aspectRatio: payload?.generation?.aspectRatio || '9:16',
      durationSec: Number.isFinite(payload?.generation?.durationSec) ? payload.generation.durationSec : 30,
      ctaText: clampText(payload?.generation?.ctaText || 'Shop Now', 40),
      prompt: '',
      negativePrompt: clampText(payload?.generation?.negativePrompt, 600),
    }
    const video = {
      id: generateId(),
      vaultId,
      status: 'draft',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ideaText: clampText(payload?.ideaText, 2000),
      ideaAttachment: payload?.ideaAttachment || null,
      generation,
      job: null,
      videoAssets: [],
    }
    const prompt = buildAutoPrompt({ vault, video })
    const finalVideo = { ...video, generation: { ...generation, prompt } }
    setVideos((prev) => [finalVideo, ...prev])
    return finalVideo
  }

  const updateVideo = (videoId, updates) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v
        const next = {
          ...v,
          ...updates,
          generation: updates.generation ? { ...v.generation, ...updates.generation } : v.generation,
          updatedAt: nowIso(),
        }
        return next
      })
    )
  }

  const rebuildVideoPrompt = (videoId) => {
    const currentVideo = videos.find((v) => v.id === videoId) || null
    if (!currentVideo) return null
    const vault = vaults.find((x) => x.id === currentVideo.vaultId) || null
    const prompt = buildAutoPrompt({ vault, video: currentVideo })
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId ? { ...v, generation: { ...v.generation, prompt }, updatedAt: nowIso() } : v
      )
    )
    return prompt
  }

  const startVideoGeneration = (videoId) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v
        const etaMs = 5200
        return {
          ...v,
          status: 'generating',
          updatedAt: nowIso(),
          job: { status: 'processing', startedAt: Date.now(), etaMs },
        }
      })
    )
  }

  const regenerateVideo = (videoId) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v
        const etaMs = 5200
        return {
          ...v,
          status: 'generating',
          updatedAt: nowIso(),
          job: { status: 'processing', startedAt: Date.now(), etaMs },
          videoAssets: [],
        }
      })
    )
  }

  const value = {
    vaults,
    activeVaultId,
    videos,
    setActiveVaultId,
    createVault,
    updateVault,
    createVideoVersion,
    updateVideo,
    rebuildVideoPrompt,
    startVideoGeneration,
    regenerateVideo,
  }

  return <LiquidContext.Provider value={value}>{children}</LiquidContext.Provider>
}
