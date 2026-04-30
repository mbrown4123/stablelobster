const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let db = null;
const DB_PATH = process.env.DB_PATH || './data/stablelobster.db';

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initDB() {
  const SQL = await initSqlJs();

  // Try to load existing database
  let existingData = null;
  if (fs.existsSync(DB_PATH)) {
    existingData = fs.readFileSync(DB_PATH);
  }

  if (existingData) {
    db = new SQL.Database(existingData);
  } else {
    db = new SQL.Database();
    createTables();
    saveDB();
  }

  return db;
}

function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_str TEXT UNIQUE NOT NULL,
      series TEXT NOT NULL,
      release_date TEXT NOT NULL,
      description TEXT,
      html_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id INTEGER NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('agent', 'human')),
      status TEXT NOT NULL CHECK(status IN ('safe', 'broken')),
      category TEXT,
      os TEXT,
      node_version TEXT,
      error_tail TEXT,
      install_id_hash TEXT,
      session_token TEXT,
      ip_hash TEXT,
      payload_signature TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (version_id) REFERENCES versions(id),
      UNIQUE(version_id, install_id_hash)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      install_id_hash TEXT UNIQUE NOT NULL,
      last_version_id INTEGER,
      last_status TEXT,
      last_vote_at TEXT,
      total_votes INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (last_version_id) REFERENCES versions(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      last_reported_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (version_id) REFERENCES versions(id),
      UNIQUE(version_id, category)
    );
  `);

  // Create indexes for performance
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_version ON votes(version_id);');
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_source ON votes(source);');
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_status ON votes(status);');
  db.run('CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);');
  db.run('CREATE INDEX IF NOT EXISTS idx_versions_series ON versions(series);');
  db.run('CREATE INDEX IF NOT EXISTS idx_agents_install_id ON agents(install_id_hash);');
}

function saveDB() {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

function hashInstallId(installId, salt = null) {
  const actualSalt = salt || process.env.INSTALL_ID_SALT || 'default-salt-change-me';
  return crypto
    .createHash('sha256')
    .update(installId + actualSalt)
    .digest('hex');
}

function hashIP(ip) {
  return crypto
    .createHash('sha256')
    .update(ip + 'ip-salt')
    .digest('hex');
}

// Database operations
function getAllVersions() {
  const result = db.exec('SELECT * FROM versions ORDER BY release_date DESC;');
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const version = {};
    columns.forEach((col, i) => {
      version[col] = row[i];
    });
    return version;
  });
}

function getVersionById(id) {
  const stmt = db.prepare('SELECT * FROM versions WHERE id = ?;');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function getOrCreateVersion(versionStr, series, releaseDate, description = null, htmlUrl = null) {
  let version = getVersionByString(versionStr);
  if (version) return version;

  db.run(
    'INSERT INTO versions (version_str, series, release_date, description, html_url) VALUES (?, ?, ?, ?, ?);',
    [versionStr, series, releaseDate, description, htmlUrl]
  );
  saveDB();
  return getVersionByString(versionStr);
}

function getVersionByString(versionStr) {
  const stmt = db.prepare('SELECT * FROM versions WHERE version_str = ?;');
  stmt.bind([versionStr]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function addVote(voteData) {
  const {
    version_id,
    source,
    status,
    category,
    os,
    node_version,
    error_tail,
    install_id,
    session_token,
    ip,
    payload_signature
  } = voteData;

  const installIdHash = install_id ? hashInstallId(install_id) : null;
  const ipHash = ip ? hashIP(ip) : null;

  // Check for duplicate agent vote
  if (installIdHash) {
    const existing = db.exec(
      `SELECT id FROM votes WHERE version_id = ${version_id} AND install_id_hash = '${installIdHash}';`
    );
    if (existing.length > 0 && existing[0].values.length > 0) {
      return { error: 'Duplicate vote', code: 'DUPLICATE_VOTE' };
    }
  }

  const categorySql = category ? `'${category.replace(/'/g, "''")}'` : 'NULL';
  const osSql = os ? `'${os.replace(/'/g, "''")}'` : 'NULL';
  const nodeVersionSql = node_version ? `'${node_version.replace(/'/g, "''")}'` : 'NULL';
  const errorTailSql = error_tail ? `'${error_tail.replace(/'/g, "''")}'` : 'NULL';
  const installIdHashSql = installIdHash ? `'${installIdHash}'` : 'NULL';
  const sessionTokenSql = session_token ? `'${session_token}'` : 'NULL';
  const ipHashSql = ipHash ? `'${ipHash}'` : 'NULL';
  const payloadSignatureSql = payload_signature ? `'${payload_signature}'` : 'NULL';

  db.run(
    `INSERT INTO votes (version_id, source, status, category, os, node_version, error_tail, install_id_hash, session_token, ip_hash, payload_signature)
     VALUES (${version_id}, '${source}', '${status}', ${categorySql}, ${osSql}, ${nodeVersionSql}, ${errorTailSql}, ${installIdHashSql}, ${sessionTokenSql}, ${ipHashSql}, ${payloadSignatureSql});`
  );

  // Update or create agent record
  if (installIdHash) {
    const agentExists = db.exec(
      `SELECT id FROM agents WHERE install_id_hash = '${installIdHash}';`
    );
    
    if (agentExists.length > 0 && agentExists[0].values.length > 0) {
      db.run(
        `UPDATE agents SET last_version_id = ${version_id}, last_status = '${status}', 
         last_vote_at = CURRENT_TIMESTAMP, total_votes = total_votes + 1
         WHERE install_id_hash = '${installIdHash}';`
      );
    } else {
      db.run(
        `INSERT INTO agents (install_id_hash, last_version_id, last_status, total_votes)
         VALUES ('${installIdHash}', ${version_id}, '${status}', 1);`
      );
    }
  }

  // Update or create issue record
  if (status === 'broken' && category) {
    const issueExists = db.exec(
      `SELECT id FROM issues WHERE version_id = ${version_id} AND category = '${category}';`
    );
    
    if (issueExists.length > 0 && issueExists[0].values.length > 0) {
      db.run(
        `UPDATE issues SET count = count + 1, last_reported_at = CURRENT_TIMESTAMP
         WHERE version_id = ${version_id} AND category = '${category}';`
      );
    } else {
      db.run(
        `INSERT INTO issues (version_id, category, count) VALUES (${version_id}, '${category}', 1);`
      );
    }
  }

  saveDB();
  return { success: true };
}

function getVersionStatus(versionId) {
  const version = getVersionById(versionId);
  if (!version) return null;

  const totalVotes = db.exec(
    `SELECT COUNT(*) as count FROM votes WHERE version_id = ${versionId};`
  )[0]?.values[0]?.[0] || 0;

  if (totalVotes < 5) {
    return {
      version,
      status: {
        score: null,
        status: 'Too few data points',
        color: '⚪',
        total_votes: totalVotes,
        last_verified: null
      },
      issues: []
    };
  }

  const safeVotes = db.exec(
    `SELECT COUNT(*) as count FROM votes WHERE version_id = ${versionId} AND status = 'safe';`
  )[0]?.values[0]?.[0] || 0;

  const lastVote = db.exec(
    `SELECT created_at FROM votes WHERE version_id = ${versionId} ORDER BY created_at DESC LIMIT 1;`
  );
  const lastVerified = lastVote.length > 0 ? lastVote[0].values[0]?.[0] : null;

  const score = Math.round((safeVotes / totalVotes) * 100);
  const status = score >= 70 ? 'Safe' : 'Broken';
  const color = score >= 70 ? '🟢' : score >= 40 ? '🟡' : '🔴';

  const issues = db.exec(
    `SELECT category, count, SUM(count) as total FROM issues 
     WHERE version_id = ${versionId} GROUP BY category;`
  );

  const totalIssues = issues.length > 0 ? issues[0].values.reduce((sum, row) => sum + row[1], 0) : 0;
  
  const issueBreakdown = issues.length > 0 ? issues[0].values.map(row => ({
    category: row[0],
    count: row[1],
    percentage: totalIssues > 0 ? Math.round((row[1] / totalIssues) * 100) : 0
  })) : [];

  return {
    version,
    status: {
      score,
      status,
      color,
      total_votes: totalVotes,
      last_verified: lastVerified
    },
    issues: issueBreakdown
  };
}

function getIssueBreakdown(versionId) {
  const issues = db.exec(
    `SELECT category, count, SUM(count) as total FROM issues 
     WHERE version_id = ${versionId} GROUP BY category ORDER BY count DESC;`
  );

  if (issues.length === 0) return [];

  const totalIssues = issues[0].values.reduce((sum, row) => sum + row[1], 0);
  
  return issues[0].values.map(row => ({
    category: row[0],
    count: row[1],
    percentage: Math.round((row[1] / totalIssues) * 100)
  }));
}

function getAllVotes(limit = 100, offset = 0) {
  const result = db.exec(
    `SELECT votes.*, versions.version_str 
     FROM votes 
     JOIN versions ON votes.version_id = versions.id 
     ORDER BY votes.created_at DESC LIMIT ${limit} OFFSET ${offset};`
  );

  if (result.length === 0) return [];

  const columns = result[0].columns;
  return result[0].values.map(row => {
    const vote = {};
    columns.forEach((col, i) => {
      vote[col] = row[i];
    });
    return vote;
  });
}

function exportToCSV() {
  const votes = getAllVotes(10000);
  if (votes.length === 0) return 'version_str,source,status,category,os,node_version,created_at\n';

  let csv = 'version_str,source,status,category,os,node_version,created_at\n';
  votes.forEach(vote => {
    csv += `${vote.version_str || ''},${vote.source || ''},${vote.status || ''},${vote.category || ''},${vote.os || ''},${vote.node_version || ''},${vote.created_at || ''}\n`;
  });
  return csv;
}

function deleteAllVotes() {
  db.run('DELETE FROM votes;');
  db.run('DELETE FROM issues;');
  saveDB();
  return { success: true };
}

module.exports = {
  initDB,
  saveDB,
  hashInstallId,
  hashIP,
  getAllVersions,
  getVersionById,
  getOrCreateVersion,
  getVersionByString,
  addVote,
  getVersionStatus,
  getIssueBreakdown,
  getAllVotes,
  exportToCSV,
  deleteAllVotes
};
