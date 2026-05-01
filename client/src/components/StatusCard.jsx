import { useState, useEffect } from 'react'

function StatusCard({ status, version, issues }) {
  const [lastVerified, setLastVerified] = useState(null)
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (status?.last_verified) {
      setLastVerified(new Date(status.last_verified))
    }
  }, [status?.last_verified])

  useEffect(() => {
    if (!lastVerified) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = Math.floor((now - lastVerified) / 1000)
      
      if (diff < 60) {
        setTimeAgo(`${diff}s ago`)
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)}m ago`)
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)}h ago`)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lastVerified])

  const score = status?.score || 0
  const totalVotes = status?.total_votes || 0
  const safeVotes = status?.safe || 0
  const brokenVotes = status?.broken || 0
  const activeAgents = status?.active_agents || 0

  const statusState = status?.status === 'Safe' ? 'safe' : 
                      status?.status === 'Caution' ? 'caution' : 'broken'

  return (
    <div className={`status-card ${statusState}`}>
      {/* Main status display */}
      <div className={`status-main ${statusState}`}>
        <div className="status-header">
          <span className="status-icon">
            {statusState === 'safe' ? '✓' : statusState === 'caution' ? '⚠' : '✕'}
          </span>
          <span className="status-text">{status?.status || 'Loading...'}</span>
        </div>
        
        <div className="confidence-section">
          {totalVotes < 5 ? (
            <div className="low-data">
              <span className="low-data-icon">📊</span>
              <span>Insufficient data</span>
            </div>
          ) : (
            <div className="confidence-score">
              <span className="score">{score}%</span>
              <span className="score-label">confidence</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatItem label="Total Votes" value={totalVotes} />
        <StatItem label="Safe" value={safeVotes} variant="safe" />
        <StatItem label="Broken" value={brokenVotes} variant="broken" />
        <StatItem label="Active Agents" value={activeAgents} />
      </div>

      {/* Last verified */}
      {lastVerified && (
        <div className="last-verified">
          <span className="verified-icon">✓</span>
          <span className="verified-text">Last verified: {timeAgo}</span>
        </div>
      )}

      {/* Version info */}
      {version && (
        <div className="version-info">
          <span className="version-badge">{version.version_str}</span>
          {version.is_new && (
            <span className="badge-new">🔥 New</span>
          )}
        </div>
      )}

      {/* Top issue */}
      {issues && issues.length > 0 && issues[0]?.count > 0 && (
        <div className="top-issue">
          <span className="issue-label">Top Issue:</span>
          <span className="issue-name">{issues[0].category}</span>
          <span className="issue-percentage">({issues[0].percentage?.toFixed(0)}%)</span>
        </div>
      )}

      <style>{`
        .status-card {
          background: var(--surface-card);
          border: 2px solid var(--border-subtle);
          border-radius: 1.25rem;
          padding: 2rem;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px var(--shadow-coral-soft);
        }

        .status-main {
          text-align: center;
          padding: 1.75rem;
          border-radius: 1rem;
          margin-bottom: 1.75rem;
        }

        .status-main.safe {
          background: var(--surface-coral-soft);
          border: 2px solid var(--border-accent);
        }

        .status-main.caution {
          background: var(--surface-coral-soft);
          border: 2px solid var(--border-accent);
        }

        .status-main.broken {
          background: var(--surface-coral-soft);
          border: 2px solid var(--border-accent);
        }

        .status-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.875rem;
          margin-bottom: 1.25rem;
        }

        .status-icon {
          font-size: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--surface-interactive);
          border-radius: 0.75rem;
        }

        .status-text {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .confidence-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .confidence-score {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score {
          font-size: 3rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .low-data {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.125rem;
          color: var(--text-secondary);
          font-style: italic;
          padding: 0.75rem 1.25rem;
          background: var(--bg-elevated);
          border-radius: 0.625rem;
        }

        .low-data-icon {
          font-size: 1.25rem;
        }

        .score-label {
          font-size: 0.8125rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.25rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          transition: all 0.2s ease;
        }

        .stat-item:hover {
          border-color: var(--border-accent);
          transform: translateY(-1px);
        }

        .stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .safe-stat .stat-value {
          color: var(--coral-bright);
        }

        .broken-stat .stat-value {
          color: var(--coral-bright);
        }

        .last-verified {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.625rem;
          margin-bottom: 1rem;
        }

        .verified-icon {
          color: var(--coral-bright);
          font-weight: 700;
          font-size: 1rem;
        }

        .verified-text {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .version-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.875rem;
          margin-bottom: 1rem;
        }

        .version-badge {
          padding: 0.5rem 1rem;
          background: var(--coral-bright);
          color: white;
          border-radius: 0.625rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .badge-new {
          padding: 0.375rem 0.875rem;
          background: var(--coral-mid);
          color: white;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .top-issue {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.625rem;
          font-size: 0.875rem;
        }

        .issue-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .issue-name {
          color: var(--text-primary);
          font-weight: 600;
        }

        .issue-percentage {
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .status-card {
            padding: 1.5rem;
          }

          .status-main {
            padding: 1.25rem;
          }

          .score {
            font-size: 2.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .stat-item {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

function StatItem({ label, value, variant }) {
  return (
    <div className={`stat-item ${variant ? `${variant}-stat` : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

export default StatusCard
