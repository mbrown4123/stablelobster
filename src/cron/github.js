const cron = require('node-cron');
const axios = require('axios');
const { getOrCreateVersion, getAllVersions, saveDB } = require('../database');
const { isNewVersion } = require('../utils');

// GitHub API configuration
const GITHUB_REPO = process.env.GITHUB_REPO || 'openclaw/openclaw';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Headers for GitHub API
const headers = {
  'Accept': 'application/vnd.github.v3+json'
};

if (GITHUB_TOKEN) {
  headers['Authorization'] = `token ${GITHUB_TOKEN}`;
}

/**
 * Fetch releases from GitHub API
 */
async function fetchReleases() {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${GITHUB_REPO}/releases`,
      { headers, timeout: 10000 }
    );

    return response.data;
  } catch (error) {
    console.error('GitHub API error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Parse version string to extract components
 */
function parseVersion(versionStr) {
  // Handle formats like "2026.4.1", "v2026.4.1", "2026-04-01"
  const clean = versionStr.replace(/^v/, '');
  const match = clean.match(/^(\d{4})\.(\d+)\.(\d+)/);
  
  if (match) {
    return {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      patch: parseInt(match[3]),
      series: `${match[1]}.${match[2]}`
    };
  }
  
  return { series: 'unknown' };
}

/**
 * Sync GitHub releases to database
 */
async function syncReleases() {
  console.log('Starting GitHub releases sync...');

  try {
    const releases = await fetchReleases();
    let added = 0;
    let updated = 0;
    const now = new Date().toISOString();

    for (const release of releases) {
      const versionStr = release.tag_name;
      const parsed = parseVersion(versionStr);
      const releaseDate = release.published_at;

      // Check if version already exists
      const existing = getAllVersions().find(v => v.version_str === versionStr);

      if (existing) {
        // For sql.js, we need to re-query after each insert to get updated list
        // In a production system, you'd want to cache this more efficiently
        updated++;
      } else {
        // Insert new release
        getOrCreateVersion(
          versionStr,
          parsed.series,
          releaseDate,
          release.body || null,
          release.html_url
        );
        added++;
      }

      // Mark other versions as not new if this is a new version
      if (isNewVersion(releaseDate)) {
        // sql.js doesn't support direct UPDATE with conditional on is_new
        // We'll handle this in the response
      }
    }

    saveDB();

    console.log(`GitHub sync complete: ${added} added, ${updated} updated`);
    
    // Emit event for frontend update
    if (global.io) {
      global.io.emit('versions_updated', { added, updated, timestamp: new Date().toISOString() });
    }

    return { added, updated };

  } catch (error) {
    console.error('GitHub sync failed:', error.message);
    throw error;
  }
}

/**
 * Initialize cron job
 */
function initGithubCron() {
  // Run every 15 minutes
  const cronExpression = process.env.GITHUB_SYNC_INTERVAL || '*/15 * * * *';
  
  try {
    cron.schedule(cronExpression, async () => {
      try {
        await syncReleases();
      } catch (error) {
        console.error('Cron job error:', error);
      }
    });

    console.log(`GitHub sync cron job scheduled: ${cronExpression}`);

    // Run immediately on startup
    syncReleases().catch(err => console.error('Initial sync failed:', err));

  } catch (error) {
    console.error('Failed to schedule cron job:', error);
  }
}

module.exports = {
  syncReleases,
  initGithubCron
};
