const ShareLink = require('../models/ShareLink');
const Campaign = require('../models/Campaign');
const Variant = require('../models/Variant');
const VideoAsset = require('../models/VideoAsset');
const Feedback = require('../models/Feedback');
const { generateToken } = require('../utils/crypto.util');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    if (req.query.variantId) filter.variantId = req.query.variantId;
    const items = await ShareLink.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await ShareLink.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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
    const { campaignId = null, variantId = null, permissions = ['view'], expiresAt = null } = req.body || {};
    if (!campaignId && !variantId) {
      res.status(400);
      throw new Error('campaignId or variantId is required');
    }
    const token = generateToken();
    const item = await ShareLink.create({
      workspaceId: req.workspace.id,
      campaignId,
      variantId,
      token,
      permissions,
      expiresAt,
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await ShareLink.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    const { permissions, expiresAt } = req.body || {};
    if (permissions !== undefined) item.permissions = permissions;
    if (expiresAt !== undefined) item.expiresAt = expiresAt;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await ShareLink.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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

async function publicView(req, res, next) {
  try {
    const { token } = req.params;
    const link = await ShareLink.findOne({ token, deletedAt: null });
    if (!link) {
      res.status(404);
      throw new Error('Not found');
    }
    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      res.status(410);
      throw new Error('Share link expired');
    }

    const campaignId = link.campaignId;
    const variantId = link.variantId;

    let campaign = null;
    let variants = [];
    let videoAssets = [];
    if (variantId) {
      const variant = await Variant.findOne({ _id: variantId, deletedAt: null });
      if (!variant) {
        res.status(404);
        throw new Error('Variant not found');
      }
      campaign = await Campaign.findOne({ _id: variant.campaignId, deletedAt: null });
      variants = [variant];
      videoAssets = await VideoAsset.find({ variantId, deletedAt: null });
    } else if (campaignId) {
      campaign = await Campaign.findOne({ _id: campaignId, deletedAt: null });
      if (!campaign) {
        res.status(404);
        throw new Error('Campaign not found');
      }
      variants = await Variant.find({ campaignId, deletedAt: null }).sort({ createdAt: 1 });
      videoAssets = await VideoAsset.find({ campaignId, deletedAt: null });
    }

    const feedback = variantId
      ? await Feedback.find({ variantId, deletedAt: null }).sort({ createdAt: -1 })
      : [];

    res.json({
      link: { token: link.token, permissions: link.permissions, expiresAt: link.expiresAt },
      campaign,
      variants,
      videoAssets,
      feedback,
    });
  } catch (err) {
    next(err);
  }
}

async function publicCreateFeedback(req, res, next) {
  try {
    const { token } = req.params;
    const link = await ShareLink.findOne({ token, deletedAt: null });
    if (!link) {
      res.status(404);
      throw new Error('Not found');
    }
    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
      res.status(410);
      throw new Error('Share link expired');
    }
    const permissions = Array.isArray(link.permissions) ? link.permissions : ['view'];
    if (!permissions.includes('comment') && !permissions.includes('vote')) {
      res.status(403);
      throw new Error('Feedback not allowed for this share link');
    }

    const { variantId: bodyVariantId, authorName, vote, comment } = req.body || {};
    const variantId = link.variantId || bodyVariantId;
    if (!variantId) {
      res.status(400);
      throw new Error('variantId is required');
    }

    const variant = await Variant.findOne({ _id: variantId, deletedAt: null });
    if (!variant) {
      res.status(404);
      throw new Error('Variant not found');
    }

    if (link.campaignId && String(variant.campaignId) !== String(link.campaignId)) {
      res.status(403);
      throw new Error('Variant not allowed for this campaign share link');
    }

    const feedback = await Feedback.create({
      workspaceId: link.workspaceId,
      variantId: variant._id,
      authorUserId: null,
      authorName: authorName ? String(authorName).trim() : 'Guest',
      vote: vote === null || vote === undefined ? null : Number(vote),
      comment: comment ? String(comment) : '',
    });

    res.status(201).json({ item: feedback });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, remove, publicView, publicCreateFeedback };
