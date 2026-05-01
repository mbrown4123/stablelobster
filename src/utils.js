const crypto = require('crypto');

// Hash install ID with salt
function hashInstallId(installId) {
  const salt = process.env.INSTALL_ID_SALT || 'default_salt';
  return crypto
    .createHash('sha256')
    .update(installId + salt)
    .digest('hex');
}

// Generate HMAC signature for agent payloads
function signPayload(payload, secret) {
  const payloadStr = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('hex');
}

// Verify HMAC signature
function verifySignature(payload, signature, secret) {
  const expectedSignature = signPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Generate session token for human voters
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Rate limiting helper
function checkRateLimit(req, windowMs, maxRequests) {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `rate:${ip}`;
  
  // Simple in-memory rate limiting (use Redis in production)
  const now = Date.now();
  
  if (!req.rateLimits) {
    req.rateLimits = new Map();
  }
  
  const clientData = req.rateLimits.get(key) || { count: 0, resetAt: 0 };
  
  if (now > clientData.resetAt) {
    clientData.count = 1;
    clientData.resetAt = now + windowMs;
  } else {
    clientData.count++;
  }
  
  req.rateLimits.set(key, clientData);
  
  return {
    allowed: clientData.count <= maxRequests,
    remaining: Math.max(0, maxRequests - clientData.count),
    resetAt: clientData.resetAt
  };
}

// Categorize error based on error tail
function categorizeError(errorTail) {
  if (!errorTail) return 'Other';
  
  const error = errorTail.toLowerCase();
  
  if (error.includes('config') || error.includes('configuration') || error.includes('.env')) {
    return 'Config Error';
  }
  if (error.includes('crash') || error.includes('uncaught') || error.includes('segfault')) {
    return 'Gateway Crash';
  }
  if (error.includes('network') || error.includes('connect') || error.includes('timeout') || error.includes('eaddr')) {
    return 'Network/Connectivity';
  }
  if (error.includes('slow') || error.includes('lag') || error.includes('performance') || error.includes('memory')) {
    return 'Performance Lag';
  }
  
  return 'Other';
}

// Parse version string to extract series
function parseVersionSeries(versionStr) {
  const match = versionStr.match(/^(\d{4}\.\d+)\./);
  return match ? match[1] : 'unknown';
}

// Check if version is new (<48 hours)
function isNewVersion(releaseDate) {
  if (!releaseDate) return false;
  const now = new Date();
  const release = new Date(releaseDate);
  const hoursDiff = (now - release) / (1000 * 60 * 60);
  return hoursDiff < 48;
}

// Aggregate vote stats for a version
function calculateStats(votes) {
  const total = votes.length;
  if (total === 0) return { score: 0, safe: 0, broken: 0, percentage: 0 };
  
  const safe = votes.filter(v => v.status === 'safe').length;
  const broken = votes.filter(v => v.status === 'broken').length;
  const percentage = Math.round((safe / total) * 100);
  
  return {
    score: percentage,
    safe,
    broken,
    percentage,
    total
  };
}

// Get status color based on score
function getStatusColor(score) {
  if (score >= 90) return '🟢';
  if (score >= 70) return '🟡';
  return '🔴';
}

// Get status text based on score
function getStatusText(score, totalVotes) {
  if (totalVotes < 5) return 'Too few data points';
  if (score >= 90) return 'Safe';
  if (score >= 70) return 'Caution';
  return 'Broken';
}

module.exports = {
  hashInstallId,
  signPayload,
  verifySignature,
  generateSessionToken,
  checkRateLimit,
  categorizeError,
  parseVersionSeries,
  isNewVersion,
  calculateStats,
  getStatusColor,
  getStatusText
};
