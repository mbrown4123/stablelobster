const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

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
    // Create new database and seed it
    db = new SQL.Database();
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version_str TEXT UNIQUE NOT NULL,
        series TEXT NOT NULL,
        release_date TEXT NOT NULL,
        html_url TEXT,
        status TEXT NOT NULL,
        platform TEXT NOT NULL
      )
    `);

    // SEED DATA: Insert initial versions immediately
    const now = new Date().toISOString();
    const majorDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    db.run(`INSERT INTO versions (version_str, series, release_date, html_url, status, platform) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      ["22.22.2", "Major Releases", majorDate, "https://github.com/mbrown4123/stablelobster/releases/tag/v22.22.2", "live", "all"]);
    
    db.run(`INSERT INTO versions (version_str, series, release_date, html_url, status, platform) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      ["22.21.0", "Beta", now, "https://github.com/mbrown4123/stablelobster/releases/tag/v22.21.0", "beta", "all"]);

    // Save to disk
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    
    console.log("Database created and seeded with initial versions.");
  }

  // Attach to global so routes can access it
  global.db = db;
  return db;
}

function createTables() {
  // This function is now handled in initDB for simplicity
}

// Database operations using global.db
function getAllVersions() {
  if (!global.db) throw new Error("Database not initialized");
  const result = global.db.exec('SELECT * FROM versions ORDER BY release_date DESC;');
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const version = {};
    columns.forEach((col, i) => { version[col] = row[i]; });
    return version;
  });
}

function getVersionById(id) {
  if (!global.db) throw new Error("Database not initialized");
  const stmt = global.db.prepare('SELECT * FROM versions WHERE id = ?;');
  stmt.bind([id]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return row;
}

function getVersionStatus(versionId) {
  if (!global.db) throw new Error("Database not initialized");
  const stmt = global.db.prepare('SELECT status FROM versions WHERE id = ?;');
  stmt.bind([versionId]);
  if (!stmt.step()) {
    stmt.free();
    return null;
  }
  const row = stmt.getAsObject();
  stmt.free();
  return row.status;
}

function saveDB() {
  if (global.db) {
    const data = global.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

module.exports = {
  initDB,
  getAllVersions,
  getVersionById,
  getVersionStatus,
  saveDB
};
