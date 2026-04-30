import { useState } from 'react'

function VersionList({ versions, currentVersion, onSelect, releaseType }) {
  const [expandedSeries, setExpandedSeries] = useState({})

  const toggleSeries = (series) => {
    setExpandedSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }))
  }



  if (!versions || Object.keys(versions).length === 0) {
    return (
      <div className="version-list">
        <h2>Versions</h2>
        <div className="loading">Loading versions...</div>
      </div>
    )
  }

  // Determine what we're showing
  const viewLabel = releaseType === 'beta' 
    ? 'Beta Releases' 
    : 'Major Releases'

  const allVersions = Object.values(versions).flat()
  
  // Filter new versions: exclude betas, sort by date desc, take top 3
  const newVersions = allVersions
    .filter(v => v.is_new && !v.version_str?.toLowerCase().includes('beta'))
    .sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
    .slice(0, 3)
  
  // Use 3-column grid to fit 3 cards evenly
  const gridColumns = 3
  Object.entries(versions).forEach(([series, seriesVersions]) => {
    const nonNewVersions = seriesVersions.filter(v => !v.is_new)
    if (nonNewVersions.length > 0) {
      seriesGroups[series] = nonNewVersions
    }
  })

  const oldVersions = allVersions.filter(v => {
    const year = parseInt(v.series.split('.')[0])
    return year < 2026 && !v.is_new
  })

  return (
    <div className="version-list">
      <div className="list-header">
        <h2>{viewLabel}</h2>
      </div>

      {newVersions.length > 0 && (
        <div className="version-section">
          <h3 className="section-title">
            <span className="fire">🔥</span> New Releases
          </h3>
          <div className="version-grid">
            {newVersions.map(version => (
              <VersionCard
                key={version.id}
                version={version}
                isSelected={currentVersion?.id === version.id}
                onClick={() => onSelect(version)}
                isLatestNonBeta={version.is_new}
              />
            ))}
          </div>
        </div>
      )}

      {Object.entries(seriesGroups).map(([series, seriesVersions], index) => {
        const isExpanded = expandedSeries[series] !== false

        return (
          <div key={series} className="version-series">
            <button
              className="series-header"
              onClick={() => toggleSeries(series)}
            >
              <span className="series-name">{series}</span>
              <span className="series-count">{seriesVersions.length} version(s)</span>
              <span className="expand-icon" style={{ transform: `rotate(${isExpanded ? 180 : 0}deg)` }}>
                ▼
              </span>
            </button>

            {isExpanded && (
              <div className="series-versions">
                {seriesVersions
                  .filter(v => parseInt(v.series.split('.')[0]) >= 2026)
                  .map(version => (
                    <VersionCard
                      key={version.id}
                      version={version}
                      isSelected={currentVersion?.id === version.id}
                      onClick={() => onSelect(version)}
                      isLatestNonBeta={false}
                    />
                  ))}
              </div>
            )}
          </div>
        )
      })}

      {oldVersions.length > 0 && (
        <div className="archive-section">
          <h3 className="section-title">Historical Archive</h3>
          <div className="version-grid">
            {oldVersions.map(version => (
              <VersionCard
                key={version.id}
                version={version}
                isSelected={currentVersion?.id === version.id}
                onClick={() => onSelect(version)}
                isLatestNonBeta={false}
              />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .version-list {
          width: 100%;
          max-width: 950px;
          margin: 0 auto;
        }

        .list-header h2 {
          margin: 0;
          font-size: 1.5rem;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .version-section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 1.25rem;
          margin-bottom: 1.25rem;
          color: var(--text-primary);
        }

        .fire {
          font-size: 1.25rem;
        }

        .version-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .version-series {
          margin-bottom: 1.75rem;
        }

        .series-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .series-header:hover {
          background: var(--surface-interactive);
          border-color: var(--border-accent);
        }

        .series-name {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .series-count {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .expand-icon {
          margin-left: auto;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease;
        }

        .series-versions {
          padding: 0.75rem 0;
        }

        .archive-section {
          margin-top: 2.5rem;
          padding: 1.5rem;
          background: var(--bg-elevated);
          border-radius: 1rem;
          border: 1px solid var(--border-subtle);
        }

        .card {
          padding: 1.25rem;
          background: var(--surface-card);
          border: 2px solid var(--border-subtle);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px var(--shadow-coral-soft);
        }

        .card.selected {
          border-color: var(--coral-bright);
          box-shadow: 0 0 0 3px var(--surface-coral-soft);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .card-version {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8125rem;
          margin-bottom: 0.625rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }

        .stat.safe {
          color: var(--coral-bright);
        }

        .stat.broken {
          color: var(--coral-bright);
        }

        .card-date {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .badge-new {
          padding: 0.25rem 0.625rem;
          background: var(--coral-mid);
          color: white;
          border-radius: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.safe {
          background: var(--cyan-bright);
        }

        .status-dot.caution {
          background: var(--coral-mid);
        }

        .status-dot.broken {
          background: var(--coral-bright);
        }

        @media (max-width: 640px) {
          .version-grid {
            grid-template-columns: 1fr;
          }

          .series-header {
            flex-wrap: wrap;
          }

          .list-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .toggle-buttons {
            width: 100%;
            flex-direction: column;
          }

          .archive-toggle,
          .beta-toggle {
            width: 100%;
            text-align: center;
            border-radius: 0.625rem;
          }
        }
      `}</style>
    </div>
  )
}

function VersionCard({ version, isSelected, onClick, isLatestNonBeta }) {
  return (
    <div
      className={`card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <span className="card-version">{version.version_str}</span>
        <div className="card-meta">
          {isLatestNonBeta && (
            <span className="badge-new">🔥 New</span>
          )}
          <span 
            className={`status-dot ${version.stats?.status === 'Safe' ? 'safe' : version.stats?.status === 'Caution' ? 'caution' : 'broken'}`}
          >
            {version.stats?.color}
          </span>
        </div>
      </div>

      <div className="card-stats">
        <span className="stat">
          {version.stats?.total_votes || 0} votes
        </span>
        {version.stats?.total_votes >= 5 && (
          <span className={`stat ${version.stats?.status === 'Safe' ? 'safe' : 'broken'}`}>
            {version.stats?.score}% safe
          </span>
        )}
      </div>

      <div className="card-date">
        {version.release_date ? new Date(version.release_date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) : 'Unknown date'}
      </div>
    </div>
  )
}

export default VersionList
