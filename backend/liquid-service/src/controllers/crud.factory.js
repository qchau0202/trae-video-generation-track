function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  }
  return out;
}

function createCrudController({ Model, createFields, updateFields, scopeByWorkspace = true }) {
  return {
    async list(req, res, next) {
      try {
        const filter = { deletedAt: null };
        if (scopeByWorkspace) filter.workspaceId = req.workspace.id;
        const items = await Model.find(filter).sort({ createdAt: -1 });
        res.json({ items });
      } catch (err) {
        next(err);
      }
    },

    async get(req, res, next) {
      try {
        const filter = { _id: req.params.id, deletedAt: null };
        if (scopeByWorkspace) filter.workspaceId = req.workspace.id;
        const item = await Model.findOne(filter);
        if (!item) {
          res.status(404);
          throw new Error('Not found');
        }
        res.json({ item });
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const data = pick(req.body || {}, createFields);
        if (scopeByWorkspace) data.workspaceId = req.workspace.id;
        const item = await Model.create(data);
        res.status(201).json({ item });
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const filter = { _id: req.params.id, deletedAt: null };
        if (scopeByWorkspace) filter.workspaceId = req.workspace.id;
        const updates = pick(req.body || {}, updateFields);
        const item = await Model.findOneAndUpdate(filter, updates, { new: true });
        if (!item) {
          res.status(404);
          throw new Error('Not found');
        }
        res.json({ item });
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        const filter = { _id: req.params.id, deletedAt: null };
        if (scopeByWorkspace) filter.workspaceId = req.workspace.id;
        const item = await Model.findOne(filter);
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
    },
  };
}

module.exports = { createCrudController };

