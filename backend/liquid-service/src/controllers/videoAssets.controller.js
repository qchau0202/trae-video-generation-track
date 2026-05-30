const VideoAsset = require('../models/VideoAsset');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    if (req.query.variantId) filter.variantId = req.query.variantId;
    const items = await VideoAsset.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await VideoAsset.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { campaignId, variantId, format, durationSeconds, videoUrl, captionsBurned, audioTrack } = req.body || {};
    if (!campaignId || !variantId || !format || !durationSeconds || !videoUrl) {
      res.status(400);
      throw new Error('campaignId, variantId, format, durationSeconds, videoUrl are required');
    }
    const item = await VideoAsset.create({
      workspaceId: req.workspace.id,
      campaignId,
      variantId,
      format,
      durationSeconds,
      videoUrl,
      captionsBurned: Boolean(captionsBurned),
      audioTrack: audioTrack || '',
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await VideoAsset.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    const { videoUrl, durationSeconds, captionsBurned, audioTrack } = req.body || {};
    if (videoUrl !== undefined) item.videoUrl = videoUrl;
    if (durationSeconds !== undefined) item.durationSeconds = durationSeconds;
    if (captionsBurned !== undefined) item.captionsBurned = Boolean(captionsBurned);
    if (audioTrack !== undefined) item.audioTrack = audioTrack;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await VideoAsset.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    item.deletedAt = new Date();
    await item.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, remove };

