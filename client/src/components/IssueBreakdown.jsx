import { useState } from 'react'

function IssueBreakdown({ issues }) {
  const [isOpen, setIsOpen] = useState(true)

  if (!issues || issues.length === 0) {
    return null
  }

  const totalBroken = issues.reduce((sum, issue) => sum + (issue.count || 0), 0)

  return (
    <div className="issue-breakdown">
      <button 
        className="collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="header-text">
          <span className="icon">📊</span>
          Issue Breakdown ({issues.length} reported)
        </span>
        <span className="expand-icon" style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="collapsible-content">
          <div className="issues-list">
            {issues.map((issue, index) => {
              const percentage = issue.percentage || 0
              const count = issue.count || 0
              const isTopIssue = index === 0

              return (
                <div key={issue.category || index} className="issue-item">
                  <div className="issue-header">
                    <div className="issue-info">
                      <span className={`issue-category ${isTopIssue ? 'top' : ''}`}>
                        {issue.category}
                      </span>
                      {isTopIssue && (
                        <span className="top-badge">Most Reported</span>
                      )}
                    </div>
                    <div className="issue-stats">
                      <span className="issue-count">{count} votes</span>
                      <span className="issue-percentage">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${percentage}%`,
                        background: getIssueGradient(issue.category)
                      }}
                    />
                  </div>

                  <div className="issue-description">
                    {getIssueDescription(issue.category)}
                  </div>
                </div>
              )
            })}
          </div>

          {totalBroken > 0 && (
            <div className="issues-footer">
              <span className="footer-text">
                Based on {totalBroken} broken votes
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        .issue-breakdown {
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          overflow: hidden;
          width: 100%;
        }

        .collapsible-header {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: var(--bg-elevated);
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid var(--border-subtle);
        }

        .collapsible-header:hover {
          background: var(--surface-interactive);
        }

        .header-text {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .icon {
          font-size: 1.25rem;
        }

        .expand-icon {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          transition: transform 0.2s ease;
        }

        .collapsible-content {
          padding: 1.5rem;
          background: var(--surface-card);
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .issue-item {
          padding: 1.25rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
        }

        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .issue-info {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        .issue-category {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9375rem;
        }

        .issue-category.top {
          color: var(--coral-bright);
        }

        .top-badge {
          padding: 0.25rem 0.625rem;
          background: var(--coral-mid);
          color: white;
          border-radius: 0.375rem;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .issue-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
        }

        .issue-count {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .issue-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .progress-bar-container {
          height: 10px;
          background: var(--border-subtle);
          border-radius: 0.375rem;
          overflow: hidden;
          margin-bottom: 0.875rem;
        }

        .progress-bar {
          height: 100%;
          border-radius: 0.375rem;
        }

        .issue-description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          padding: 0.75rem;
          background: var(--surface-card);
          border-radius: 0.5rem;
          border-left: 3px solid var(--coral-bright);
        }

        .issues-footer {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }

        .footer-text {
          font-size: 0.8125rem;
          color: var(--text-muted);
          font-style: italic;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .issue-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .issue-stats {
            align-items: flex-start;
          }

          .collapsible-header {
            padding: 1rem 1.25rem;
          }

          .collapsible-content {
            padding: 1.25rem;
          }

          .issue-item {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

function getIssueGradient(category) {
  const gradients = {
    'Config Error': 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
    'Gateway Crash': 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
    'Network/Connectivity': 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)',
    'Performance Lag': 'linear-gradient(90deg, #eab308 0%, #ca8a04 100%)',
    'Other': 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
  }
  return gradients[category] || 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
}

function getIssueDescription(category) {
  const descriptions = {
    'Config Error': 'Configuration files may have incorrect settings or missing required values. Check your .env and config files.',
    'Gateway Crash': 'The gateway process terminated unexpectedly. This often indicates a critical error in the startup sequence.',
    'Network/Connectivity': 'Connection issues preventing proper communication with services. May involve firewall or DNS configuration.',
    'Performance Lag': 'Slow response times or high resource usage. Check system resources and background processes.',
    'Other': 'An issue not covered by the standard categories. Review logs for specific error messages.'
  }
  return descriptions[category] || 'Reported issue category.'
}

export default IssueBreakdown
