const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const User = require('../models/User');

async function listMyWorkspaces(req, res, next) {
  try {
    const memberships = await WorkspaceMember.find({ userId: req.auth.user._id, deletedAt: null }).sort({ createdAt: 1 });
    const workspaceIds = memberships.map((m) => m.workspaceId);
    const workspaces = await Workspace.find({ _id: { $in: workspaceIds }, deletedAt: null });
    const items = memberships
      .map((m) => {
        const ws = workspaces.find((w) => String(w._id) === String(m.workspaceId));
        if (!ws) return null;
        return { id: ws._id, name: ws.name, role: m.role };
      })
      .filter(Boolean);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function createWorkspace(req, res, next) {
  try {
    const { name } = req.body || {};
    if (!name) {
      res.status(400);
      throw new Error('name is required');
    }
    const workspace = await Workspace.create({ name: String(name).trim() });
    await WorkspaceMember.create({ workspaceId: workspace._id, userId: req.auth.user._id, role: 'owner' });
    res.status(201).json({ item: { id: workspace._id, name: workspace.name, role: 'owner' } });
  } catch (err) {
    next(err);
  }
}

async function updateWorkspace(req, res, next) {
  try {
    const member = await WorkspaceMember.findOne({
      workspaceId: req.params.id,
      userId: req.auth.user._id,
      deletedAt: null,
    });
    if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
      res.status(403);
      throw new Error('Insufficient role');
    }
    const workspace = await Workspace.findOne({ _id: req.params.id, deletedAt: null });
    if (!workspace) {
      res.status(404);
      throw new Error('Not found');
    }
    const { name } = req.body || {};
    if (name !== undefined) workspace.name = String(name).trim();
    await workspace.save();
    res.json({ item: { id: workspace._id, name: workspace.name } });
  } catch (err) {
    next(err);
  }
}

async function deleteWorkspace(req, res, next) {
  try {
    const member = await WorkspaceMember.findOne({
      workspaceId: req.params.id,
      userId: req.auth.user._id,
      deletedAt: null,
    });
    if (!member || member.role !== 'owner') {
      res.status(403);
      throw new Error('Owner role required');
    }
    const workspace = await Workspace.findOne({ _id: req.params.id, deletedAt: null });
    if (!workspace) {
      res.status(404);
      throw new Error('Not found');
    }
    workspace.deletedAt = new Date();
    await workspace.save();
    await WorkspaceMember.updateMany({ workspaceId: workspace._id, deletedAt: null }, { deletedAt: new Date() });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function listMembers(req, res, next) {
  try {
    const member = await WorkspaceMember.findOne({
      workspaceId: req.params.id,
      userId: req.auth.user._id,
      deletedAt: null,
    });
    if (!member) {
      res.status(403);
      throw new Error('Not a member');
    }
    const memberships = await WorkspaceMember.find({ workspaceId: req.params.id, deletedAt: null }).sort({ createdAt: 1 });
    const userIds = memberships.map((m) => m.userId);
    const users = await User.find({ _id: { $in: userIds }, deletedAt: null });
    const items = memberships.map((m) => {
      const u = users.find((x) => String(x._id) === String(m.userId));
      return { userId: m.userId, email: u?.email || '', displayName: u?.displayName || '', role: m.role };
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

async function inviteMember(req, res, next) {
  try {
    const requester = await WorkspaceMember.findOne({
      workspaceId: req.params.id,
      userId: req.auth.user._id,
      deletedAt: null,
    });
    if (!requester || (requester.role !== 'owner' && requester.role !== 'admin')) {
      res.status(403);
      throw new Error('Insufficient role');
    }
    const { email, role } = req.body || {};
    if (!email || !role) {
      res.status(400);
      throw new Error('email and role are required');
    }
    const user = await User.findOne({ email: String(email).toLowerCase(), deletedAt: null });
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    const membership = await WorkspaceMember.findOneAndUpdate(
      { workspaceId: req.params.id, userId: user._id },
      { workspaceId: req.params.id, userId: user._id, role, deletedAt: null },
      { upsert: true, new: true }
    );
    res.status(201).json({ item: { userId: membership.userId, role: membership.role } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMyWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  inviteMember,
};

