const express = require('express');
const {
  getAllVersions,
  getVersionById,
  getVersionStatus,
  addVote,
  hashInstallId
} = require('../database');
const {
  signPayload,
  verifySignature,
  generateSessionToken,
  checkRateLimit,
  categorizeError,
  isNewVersion
} = require('../utils');

const router = express.Router();

// Rate limiter config
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 min
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10;

// POST /api/vote - Accept votes from agents and humans
router.post('/vote', (req, res) => {
  try {
    const {
      install_id,
      version_id,
      status,
      category,
      os,
      node_version,
      error_tail,
      payload_signature,
      source = 'human'
    } = req.body;

    // Validation
    if (!install_id || !version_id || !status) {
      return res.status(400).json({ error: 'Missing required fields: install_id, version_id, status' });
    }

    if (!['safe', 'broken'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "safe" or "broken"' });
    }

    // For agents: verify signature
    if (source === 'agent') {
      if (!payload_signature) {
        return res.status(400).json({ error: 'Agent votes require payload_signature' });
      }
      
      const sigValid = verifySignature(req.body, process.env.INSTALL_ID_SALT);
      if (!sigValid) {
        return res.status(403).json({ error: 'Invalid payload signature' });
      }
    }

    // Auto-categorize if agent and no category provided
    let finalCategory = category;
    if (source === 'agent' && status === 'broken' && !category) {
      finalCategory = categorizeError(error_tail);
    }

    // Add vote
    const result = addVote({
      version_id: parseInt(version_id),
      source,
      status,
      category: finalCategory,
      os,
      node_version,
      error_tail,
      install_id,
      session_token: null,
      ip: req.ip,
      payload_signature
    });

    if (result.error) {
      if (result.code === 'DUPLICATE_VOTE') {
        return res.status(409).json({ error: 'Vote already recorded for this version' });
      }
      return res.status(400).json({ error: result.error });
    }

    // Emit WebSocket event
    if (global.io) {
      global.io.emit('vote', { version_id, status, timestamp: new Date().toISOString() });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/vote/human - Human vote with session management
router.post('/vote/human', (req, res) => {
  try {
    // Check rate limit
    const rateLimit = checkRateLimit(req, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded', 
        retry_after: Math.ceil((rateLimit.resetAt - Date.now()) / 1000) 
      });
    }

    const { version_id, status, category } = req.body;
    
    if (!status || !['safe', 'broken'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    if (status === 'broken' && !category) {
      return res.status(400).json({ error: 'Category required for broken votes' });
    }

    // Generate or use existing session token
    let sessionId = req.body.session_id || generateSessionToken();
    const hashedInstallId = `human_${sessionId}`;

    // Add vote
    const result = addVote({
      version_id: parseInt(version_id),
      source: 'human',
      status,
      category,
      install_id: sessionId, // Will be hashed internally
      session_token: sessionId,
      ip: req.ip
    });

    if (result.error) {
      if (result.code === 'DUPLICATE_VOTE') {
        return res.status(409).json({ error: 'Vote already recorded for this session' });
      }
      return res.status(400).json({ error: result.error });
    }

    // Emit WebSocket event
    if (global.io) {
      global.io.emit('vote', { version_id, status, timestamp: new Date().toISOString() });
    }

    res.status(201).json({ 
      success: true, 
      session_id: sessionId
    });

  } catch (error) {
    console.error('Human vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/status/:version_id - Get status for a specific version
router.get('/status/:version_id', (req, res) => {
  try {
    const { version_id } = req.params;
    const { platform } = req.query;

    const statusData = getVersionStatus(parseInt(version_id));
    
    if (!statusData) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Platform filtering would need to be implemented in the database module
    // For now, return the global status
    
    res.json(statusData);

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/versions - List all versions
router.get('/versions', (req, res) => {
  try {
    const versions = getAllVersions();

    // Add basic metadata
    const versionsWithMeta = versions.map(version => {
      return {
        id: version.id,
        version_str: version.version_str,
        series: version.series,
        release_date: version.release_date,
        is_new: isNewVersion(version.release_date),
        github_url: version.html_url
      };
    });

    // Group by series
    const grouped = {};
    versionsWithMeta.forEach(v => {
      if (!grouped[v.series]) {
        grouped[v.series] = [];
      }
      grouped[v.series].push(v);
    });

    res.json({
      versions: grouped,
      total: versions.length
    });

  } catch (error) {
    console.error('Versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/votes/24h - Get 24h vote history for graphs
router.get('/votes/24h', (req, res) => {
  try {
    // This would need to be implemented in the database module
    // For now, return empty data
    res.json({
      data: [],
      since: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      platform: 'global',
      version_id: 'all'
    });

  } catch (error) {
    console.error('24h votes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
