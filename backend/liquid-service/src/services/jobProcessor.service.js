const Campaign = require('../models/Campaign');
const GenerationJob = require('../models/GenerationJob');
const Variant = require('../models/Variant');
const VideoAsset = require('../models/VideoAsset');
const { generateVideo } = require('./pixverse.service');

async function updateCampaignStatusIfComplete({ campaignId, workspaceId }) {
  const variants = await Variant.find({ campaignId, workspaceId, deletedAt: null });
  if (variants.length === 0) return;

  const anyFailed = variants.some((v) => v.status === 'failed');
  const allReady = variants.every((v) => v.status === 'ready');
  const campaign = await Campaign.findOne({ _id: campaignId, workspaceId, deletedAt: null });
  if (!campaign) return;

  if (anyFailed) {
    campaign.status = 'failed';
    await campaign.save();
    return;
  }

  if (allReady) {
    campaign.status = 'ready';
    await campaign.save();
  }
}

async function processOneJob() {
  const lockExpiryMs = 60_000;
  const now = new Date();
  const lockCutoff = new Date(Date.now() - lockExpiryMs);

  const job = await GenerationJob.findOneAndUpdate(
    {
      deletedAt: null,
      status: { $in: ['submitted', 'processing'] },
      $or: [{ lockedAt: null }, { lockedAt: { $lte: lockCutoff } }],
    },
    { lockedAt: now, status: 'processing' },
    { new: true }
  );

  if (!job) return false;

  try {
    job.attempts += 1;
    await job.save();

    const result = await generateVideo(job.requestPayload);
    if (!result.videoUrl) {
      throw new Error('PixVerse did not return a videoUrl');
    }

    await VideoAsset.findOneAndUpdate(
      {
        workspaceId: job.workspaceId,
        campaignId: job.campaignId,
        variantId: job.variantId,
        format: job.format,
        deletedAt: null,
      },
      {
        workspaceId: job.workspaceId,
        campaignId: job.campaignId,
        variantId: job.variantId,
        format: job.format,
        durationSeconds: result.durationSeconds || 30,
        videoUrl: result.videoUrl,
        captionsBurned: Boolean(job.requestPayload?.captionsBurned),
      },
      { upsert: true, new: true }
    );

    job.providerJobId = result.providerJobId || job.providerJobId;
    job.status = 'done';
    job.resultPayload = result.raw || {};
    job.errorMessage = '';
    job.lockedAt = null;
    await job.save();

    const remaining = await GenerationJob.countDocuments({
      variantId: job.variantId,
      workspaceId: job.workspaceId,
      deletedAt: null,
      status: { $ne: 'done' },
    });

    if (remaining === 0) {
      await Variant.findOneAndUpdate(
        { _id: job.variantId, workspaceId: job.workspaceId, deletedAt: null },
        { status: 'ready' }
      );
      await updateCampaignStatusIfComplete({ campaignId: job.campaignId, workspaceId: job.workspaceId });
    }
  } catch (err) {
    const maxAttempts = Number(process.env.GENERATION_MAX_ATTEMPTS || 3);
    job.errorMessage = String(err?.message || 'Generation failed');
    job.lockedAt = null;
    if (job.attempts >= maxAttempts) {
      job.status = 'error';
      await job.save();
      await Variant.findOneAndUpdate(
        { _id: job.variantId, workspaceId: job.workspaceId, deletedAt: null },
        { status: 'failed' }
      );
      await updateCampaignStatusIfComplete({ campaignId: job.campaignId, workspaceId: job.workspaceId });
    } else {
      job.status = 'submitted';
      await job.save();
    }
  }

  return true;
}

function startJobProcessor() {
  const intervalMs = Math.max(500, Number(process.env.JOB_PROCESSOR_INTERVAL_MS || 1500));
  let running = false;

  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      let didWork = true;
      const maxPerTick = Math.max(1, Number(process.env.JOB_PROCESSOR_MAX_PER_TICK || 3));
      let count = 0;
      while (didWork && count < maxPerTick) {
        didWork = await processOneJob();
        count += 1;
      }
    } finally {
      running = false;
    }
  }, intervalMs);
}

module.exports = { startJobProcessor };

