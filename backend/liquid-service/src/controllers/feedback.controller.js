const Feedback = require('../models/Feedback');

async function list(req, res, next) {
  try {
    const filter = { workspaceId: req.workspace.id, deletedAt: null };
    if (req.query.variantId) filter.variantId = req.query.variantId;
    const items = await Feedback.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const item = await Feedback.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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
    const { variantId, vote, comment, authorName } = req.body || {};
    if (!variantId) {
      res.status(400);
      throw new Error('variantId is required');
    }
    const item = await Feedback.create({
      workspaceId: req.workspace.id,
      variantId,
      authorUserId: req.auth?.user?._id || null,
      authorName: authorName || (req.auth?.user?.displayName || ''),
      vote: vote === null || vote === undefined ? null : Number(vote),
      comment: comment || '',
    });
    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const item = await Feedback.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
    if (!item) {
      res.status(404);
      throw new Error('Not found');
    }
    const { vote, comment } = req.body || {};
    if (vote !== undefined) item.vote = vote === null ? null : Number(vote);
    if (comment !== undefined) item.comment = comment;
    await item.save();
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const item = await Feedback.findOne({ _id: req.params.id, workspaceId: req.workspace.id, deletedAt: null });
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

