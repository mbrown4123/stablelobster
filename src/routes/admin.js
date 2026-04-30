const express = require('express');
const db = require('../database');
const crypto = require('crypto');
const router = express.Router();

// Simple password hash check (in production, use bcrypt)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || 
  crypto.createHash('sha256').update('admin123').digest('hex');

// Middleware for admin authentication
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  
  // Simple token validation (in production, use JWT or session)
  if (token !== ADMIN_PASSWORD_HASH) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  next();
}

// Apply auth to all admin routes
router.use(requireAuth);

// GET /admin/health - Health check
router.get('/health', (req, res) => {
  try {
    const voteCount = db.prepare('SELECT COUNT(*) as count FROM votes').get().count;
    const versionCount = db.prepare('SELECT COUNT(*) as count FROM versions').get().count;
    const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;

    res.json({
      status: 'healthy',
      database: 'connected',
      stats: {
        total_votes: voteCount,
        total_versions: versionCount,
        active_agents: agentCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

// GET /admin/votes - Raw votes data
router.get('/votes', (req, res) => {
  try {
    const { limit = 100, offset = 0, version_id, status } = req.query;

    let query = `
      SELECT v.*, ve.version_str, ve.series
      FROM votes v
      JOIN versions ve ON v.version_id = ve.id
    `;

    const params = [];

    if (version_id) {
      query += ` WHERE v.version_id = ?`;
      params.push(version_id);
    }

    if (status) {
      query += query.includes('WHERE') ? ' AND v.status = ?' : ' WHERE v.status = ?';
      params.push(status);
    }

    query += ` ORDER BY v.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const votes = db.prepare(query).all(...params);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM votes v
      ${version_id ? 'WHERE v.version_id = ?' : ''}
      ${status ? (version_id ? ' AND v.status = ?' : ' WHERE v.status = ?') : ''}
    `).get(version_id, status);

    res.json({
      votes,
      pagination: {
        total: total.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Admin votes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/versions - All versions with stats
router.get('/versions', (req, res) => {
  try {
    const versions = db.prepare(`
      SELECT 
        ve.*,
        (SELECT COUNT(*) FROM votes WHERE version_id = ve.id) as total_votes,
        (SELECT COUNT(*) FROM votes WHERE version_id = ve.id AND status = 'safe') as safe_votes,
        (SELECT COUNT(*) FROM votes WHERE version_id = ve.id AND status = 'broken') as broken_votes
      FROM versions ve
      ORDER BY ve.release_date DESC
    `).all();

    res.json({ versions });
  } catch (error) {
    console.error('Admin versions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/agents - All agents
router.get('/agents', (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const agents = db.prepare(`
      SELECT * FROM agents
      ORDER BY last_seen DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    const total = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;

    res.json({
      agents,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    console.error('Admin agents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/votes/:id - Delete a specific vote (kill switch)
router.delete('/votes/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = db.prepare('SELECT id, install_id, version_id FROM votes WHERE id = ?').get(id);

    if (!existing) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    // Delete the vote
    db.prepare('DELETE FROM votes WHERE id = ?').run(id);

    // Update issues count if it was a broken vote
    if (existing.status === 'broken') {
      db.prepare(`
        UPDATE issues 
        SET count = count - 1,
            percentage = (
              SELECT 
                CAST(count AS REAL) * 100 / NULLIF(
                  (SELECT COUNT(*) FROM votes WHERE version_id = ? AND status = 'broken'),
                  0
                )
            )
        WHERE version_id = ? AND category = ?
      `).run(existing.version_id, existing.version_id, existing.category);
    }

    // Emit update
    if (req.app.io) {
      req.app.io.emit('vote_deleted', { version_id: existing.version_id });
    }

    res.json({ 
      success: true, 
      message: 'Vote deleted successfully',
      deleted_id: id 
    });
  } catch (error) {
    console.error('Delete vote error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /admin/agents/:install_id - Delete all votes for an agent (ban)
router.delete('/agents/:install_id', (req, res) => {
  try {
    const { install_id } = req.params;

    // Get all votes for this agent
    const votes = db.prepare('SELECT id, version_id, status, category FROM votes WHERE install_id = ?').all(install_id);

    if (votes.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Delete votes and update issues
    votes.forEach(vote => {
      db.prepare('DELETE FROM votes WHERE id = ?').run(vote.id);
      
      if (vote.status === 'broken') {
        db.prepare(`
          UPDATE issues 
          SET count = count - 1,
              percentage = (
                SELECT 
                  CAST(count AS REAL) * 100 / NULLIF(
                    (SELECT COUNT(*) FROM votes WHERE version_id = ? AND status = 'broken'),
                    0
                  )
              )
          WHERE version_id = ? AND category = ?
        `).run(vote.version_id, vote.version_id, vote.category);
      }
    });

    // Delete agent record
    db.prepare('DELETE FROM agents WHERE install_id = ?').run(install_id);

    // Emit updates
    const versionIds = [...new Set(votes.map(v => v.version_id))];
    versionIds.forEach(vid => {
      if (req.app.io) {
        req.app.io.emit('vote_deleted', { version_id: vid });
      }
    });

    res.json({ 
      success: true, 
      message: `Removed ${votes.length} votes and agent record`,
      deleted_count: votes.length
    });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /admin/export/csv - Export all data as CSV
router.get('/export/csv', (req, res) => {
  try {
    const votes = db.prepare(`
      SELECT v.*, ve.version_str
      FROM votes v
      JOIN versions ve ON v.version_id = ve.id
      ORDER BY v.created_at DESC
    `).all();

    // CSV header
    let csv = 'id,version_id,version_str,install_id,source,status,category,os,node_version,error_tail,ip_address,created_at\n';

    // CSV rows
    votes.forEach(v => {
      const row = [
        v.id,
        v.version_id,
        `"${v.version_str}"`,
        `"${v.install_id}"`,
        v.source,
        v.status,
        v.category || '',
        v.os || '',
        v.node_version || '',
        `"${(v.error_tail || '').replace(/"/g, '""')}"`,
        v.ip_address || '',
        v.created_at
      ];
      csv += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=stablelobster_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /admin/refresh - Trigger manual GitHub sync
router.post('/refresh', (req, res) => {
  try {
    // This will be implemented by the cron job module
    // For now, just acknowledge
    res.json({ 
      success: true, 
      message: 'Manual refresh triggered',
      note: 'GitHub sync will run on next cron interval'
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
