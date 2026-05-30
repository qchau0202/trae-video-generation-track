const AuthToken = require('../models/AuthToken');
const User = require('../models/User');
const { hashToken } = require('../utils/crypto.util');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401);
      throw new Error('Missing or invalid Authorization header');
    }

    const token = parts[1];
    const tokenHash = hashToken(token);
    const authToken = await AuthToken.findOne({ tokenHash, revokedAt: null });
    if (!authToken) {
      res.status(401);
      throw new Error('Invalid token');
    }
    if (authToken.expiresAt && authToken.expiresAt.getTime() <= Date.now()) {
      res.status(401);
      throw new Error('Token expired');
    }

    const user = await User.findOne({ _id: authToken.userId, deletedAt: null });
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    authToken.lastUsedAt = new Date();
    await authToken.save();

    req.auth = { user, authToken };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };

