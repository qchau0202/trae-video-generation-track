const crypto = require('crypto');

const DEFAULT_SAMPLE_VIDEO =
  'https://res.cloudinary.com/demo/video/upload/v1631020211/sample_video.mp4';

function isMockEnabled() {
  return String(process.env.PIXVERSE_MOCK || '').toLowerCase() === 'true' || !process.env.PIXVERSE_API_KEY;
}

async function generateVideo(payload) {
  if (isMockEnabled()) {
    const delayMs = Math.max(800, Number(process.env.PIXVERSE_MOCK_DELAY_MS || 1500));
    await new Promise((r) => setTimeout(r, delayMs));
    return {
      providerJobId: `mock_${crypto.randomUUID()}`,
      status: 'done',
      videoUrl: process.env.PIXVERSE_MOCK_VIDEO_URL || DEFAULT_SAMPLE_VIDEO,
      durationSeconds: Math.max(Number(payload?.minDurationSeconds || 30), 30),
      raw: { mock: true },
    };
  }

  const baseUrl = String(process.env.PIXVERSE_API_BASE_URL || '').replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error('PIXVERSE_API_BASE_URL is required when PIXVERSE_MOCK is false');
  }

  const response = await fetch(`${baseUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PIXVERSE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`PixVerse request failed (${response.status}): ${text || response.statusText}`);
  }

  const data = await response.json();
  if (!data?.videoUrl) {
    return {
      providerJobId: data?.jobId || '',
      status: data?.status || 'processing',
      videoUrl: '',
      durationSeconds: 0,
      raw: data,
    };
  }

  return {
    providerJobId: data?.jobId || '',
    status: 'done',
    videoUrl: data.videoUrl,
    durationSeconds: Number(data.durationSeconds || payload?.minDurationSeconds || 30),
    raw: data,
  };
}

module.exports = { generateVideo };

