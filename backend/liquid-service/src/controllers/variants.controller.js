const Variant = require('../models/Variant');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    const items = await Variant.find(filter).sort({ createdAt: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { campaignId, variantType } = req.body || {};
    if (!campaignId || !variantType) {
      res.status(400);
      throw new Error('campaignId and variantType are required');
    }
    const item = await Variant.create({
      workspaceId: req.workspace.id,
      campaignId,
      variantType,
      status: 'pending',
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await Variant.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await Variant.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    const { status } = req.body || {};
    if (status !== undefined) item.status = status;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await Variant.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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

module.exports = { list, create, get, update, remove };
