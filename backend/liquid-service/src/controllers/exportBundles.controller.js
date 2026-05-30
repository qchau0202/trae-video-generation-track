const Campaign = require('../models/Campaign');
const ExportBundle = require('../models/ExportBundle');
const Variant = require('../models/Variant');
const VideoAsset = require('../models/VideoAsset');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    const items = await ExportBundle.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await ExportBundle.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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
    const { campaignId } = req.body || {};
    if (!campaignId) {
      res.status(400);
      throw new Error('campaignId is required');
    }

    const campaign = await Campaign.findOne({ _id: campaignId, workspaceId: req.workspace.id, deletedAt: null });
    if (!campaign) {
      res.status(404);
      throw new Error('Campaign not found');
    }

    const variants = await Variant.find({ campaignId, workspaceId: req.workspace.id, deletedAt: null });
    const assets = await VideoAsset.find({ campaignId, workspaceId: req.workspace.id, deletedAt: null });

    const items = [];
    for (const variant of variants) {
      const variantAssets = assets.filter((a) => String(a.variantId) === String(variant._id));
      for (const asset of variantAssets) {
        items.push({
          variantType: variant.variantType,
          format: asset.format,
          videoUrl: asset.videoUrl,
          durationSeconds: asset.durationSeconds,
        });
      }
    }

    const bundle = await ExportBundle.create({
      workspaceId: req.workspace.id,
      campaignId: campaign._id,
      items,
      bundleUrl: '',
    });

    res.status(201).json({ item: bundle });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await ExportBundle.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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

module.exports = { list, get, create, remove };

