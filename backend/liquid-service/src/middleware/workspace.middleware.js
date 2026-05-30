const WorkspaceMember = require('../models/WorkspaceMember');

const ROLE_RANK = {
  viewer: 1,
  member: 2,
  admin: 3,
  owner: 4,
};

async function requireWorkspace(req, res, next) {
  try {
    const workspaceId = req.headers['x-workspace-id'] || req.query.workspaceId || '';
    if (!workspaceId) {
      res.status(400);
      throw new Error('Missing workspaceId (use x-workspace-id header or workspaceId query param)');
    }

    const member = await WorkspaceMember.findOne({
      workspaceId,
      userId: req.auth.user._id,
      deletedAt: null,
    });

    if (!member) {
      res.status(403);
      throw new Error('Not a member of this workspace');
    }

    req.workspace = { id: workspaceId, role: member.role };
    next();
  } catch (err) {
    next(err);
  }
}

function requireWorkspaceRole(minRole) {
  return (req, res, next) => {
    const currentRole = req.workspace?.role;
    if (!currentRole) {
      res.status(500);
      return next(new Error('Workspace context missing'));
    }
    if (ROLE_RANK[currentRole] < ROLE_RANK[minRole]) {
      res.status(403);
      return next(new Error('Insufficient role'));
    }
    next();
  };
}

module.exports = { requireWorkspace, requireWorkspaceRole, ROLE_RANK };

