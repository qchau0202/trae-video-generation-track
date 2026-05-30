const GenerationJob = require('../models/GenerationJob');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    if (req.query.variantId) filter.variantId = req.query.variantId;
    const items = await GenerationJob.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await GenerationJob.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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
    const { campaignId, variantId, format, requestPayload } = req.body || {};
    if (!campaignId || !variantId || !format) {
      res.status(400);
      throw new Error('campaignId, variantId, format are required');
    }
    const item = await GenerationJob.create({
      workspaceId: req.workspace.id,
      campaignId,
      variantId,
      format,
      provider: 'pixverse',
      status: 'submitted',
      requestPayload: requestPayload || {},
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await GenerationJob.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    const { status, errorMessage, lockedAt } = req.body || {};
    if (status !== undefined) item.status = status;
    if (errorMessage !== undefined) item.errorMessage = errorMessage;
    if (lockedAt !== undefined) item.lockedAt = lockedAt;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await GenerationJob.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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

