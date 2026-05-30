const crypto = require('crypto');

const PBKDF2_ITERATIONS = 150000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  return {
    salt,
    hash: derivedKey.toString('hex'),
    algo: `pbkdf2-${PBKDF2_DIGEST}`,
    iterations: PBKDF2_ITERATIONS,
  };
}

function verifyPassword({ password, salt, hash, iterations }) {
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations || PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST);
  const hashBuffer = Buffer.from(hash, 'hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey), hashBuffer);
}

function generateToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateToken,
  hashPassword,
  hashToken,
  verifyPassword,
};

