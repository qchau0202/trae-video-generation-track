const FrameworkTemplate = require('../models/FrameworkTemplate');

async function list(req, res, next) {
  try {
    const items = await FrameworkTemplate.find({
      deletedAt: null,
      $or: [{ workspaceId: null }, { workspaceId: req.workspace.id }],
    }).sort({ isSystem: -1, createdAt: -1 });

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await FrameworkTemplate.findOne({
      _id: req.params.id,
      deletedAt: null,
      $or: [{ workspaceId: null }, { workspaceId: req.workspace.id }],
    });
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
    const { name, goalType, supportedFormats, minDurationSeconds, slotSchema } = req.body || {};
    if (!name || !goalType) {
      res.status(400);
      throw new Error('name and goalType are required');
    }
    const item = await FrameworkTemplate.create({
      workspaceId: req.workspace.id,
      name,
      goalType,
      supportedFormats: supportedFormats || ['9:16', '1:1'],
      minDurationSeconds: minDurationSeconds || 30,
      slotSchema: Array.isArray(slotSchema) ? slotSchema : [],
      isSystem: false,
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await FrameworkTemplate.findOne({
      _id: req.params.id,
      workspaceId: req.workspace.id,
      deletedAt: null,
    });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    if (item.isSystem) {
      res.status(403);
      throw new Error('System templates cannot be modified');
    }
    const { name, goalType, supportedFormats, minDurationSeconds, slotSchema } = req.body || {};
    if (name !== undefined) item.name = name;
    if (goalType !== undefined) item.goalType = goalType;
    if (supportedFormats !== undefined) item.supportedFormats = supportedFormats;
    if (minDurationSeconds !== undefined) item.minDurationSeconds = minDurationSeconds;
    if (slotSchema !== undefined) item.slotSchema = slotSchema;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await FrameworkTemplate.findOne({
      _id: req.params.id,
      workspaceId: req.workspace.id,
      deletedAt: null,
    });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    if (item.isSystem) {
      res.status(403);
      throw new Error('System templates cannot be deleted');
    }
    item.deletedAt = new Date();
    await item.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, get, create, update, remove };

