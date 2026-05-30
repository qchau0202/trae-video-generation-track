const User = require('../models/User');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const AuthToken = require('../models/AuthToken');
const { generateToken, hashPassword, hashToken, verifyPassword } = require('../utils/crypto.util');

async function register(req, res, next) {
  try {
    const { email, password, displayName, workspaceName } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error('email and password are required');
    }
    if (String(password).length < 8) {
      res.status(400);
      throw new Error('password must be at least 8 characters');
    }

    const existing = await User.findOne({ email: String(email).toLowerCase(), deletedAt: null });
    if (existing) {
      res.status(409);
      throw new Error('email already registered');
    }

    const passwordData = hashPassword(String(password));
    const user = await User.create({
      email: String(email).toLowerCase(),
      displayName: displayName ? String(displayName) : '',
      passwordHash: passwordData.hash,
      passwordSalt: passwordData.salt,
      passwordAlgo: passwordData.algo,
      passwordIterations: passwordData.iterations,
    });

    const workspace = await Workspace.create({ name: workspaceName ? String(workspaceName) : 'My Workspace' });
    await WorkspaceMember.create({ workspaceId: workspace._id, userId: user._id, role: 'owner' });

    const token = generateToken();
    await AuthToken.create({ userId: user._id, tokenHash: hashToken(token) });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, displayName: user.displayName },
      workspace: { id: workspace._id, name: workspace.name, role: 'owner' },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error('email and password are required');
    }

    const user = await User.findOne({ email: String(email).toLowerCase(), deletedAt: null });
    if (!user) {
      res.status(401);
      throw new Error('invalid credentials');
    }

    const ok = verifyPassword({
      password: String(password),
      salt: user.passwordSalt,
      hash: user.passwordHash,
      iterations: user.passwordIterations,
    });
    if (!ok) {
      res.status(401);
      throw new Error('invalid credentials');
    }

    const member = await WorkspaceMember.findOne({ userId: user._id, deletedAt: null }).sort({ createdAt: 1 });
    if (!member) {
      res.status(500);
      throw new Error('No workspace membership found');
    }
    const workspace = await Workspace.findById(member.workspaceId);

    const token = generateToken();
    await AuthToken.create({ userId: user._id, tokenHash: hashToken(token) });

    res.json({
      token,
      user: { id: user._id, email: user.email, displayName: user.displayName },
      workspace: { id: workspace._id, name: workspace.name, role: member.role },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };

