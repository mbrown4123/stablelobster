import { useState } from 'react'
import { generateSessionToken } from '../utils/session'

const API_URL = import.meta.env.VITE_API_URL || window.location.origin

function HeroDashboard({ status, version, issues, onVoteSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [voteError, setVoteError] = useState(null)
  const [sessionId] = useState(() => {
    let token = localStorage.getItem('stablelobster_session')
    if (!token) {
      token = generateSessionToken()
      localStorage.setItem('stablelobster_session', token)
    }
    return token
  })

  const score = status?.score || 0
  const totalVotes = status?.total_votes || 0
  const safeVotes = status?.safe || 0
  const brokenVotes = status?.broken || 0
  const activeAgents = status?.active_agents || 0
  const isSafe = status?.status === 'Safe'
  const scoreState = score >= 70

  const CATEGORIES = [
    'Config Error',
    'Gateway Crash',
    'Network/Connectivity',
    'Performance Lag',
    'Other'
  ]

  const handleSubmitVote = async (status) => {
    if (!version?.id) {
      setVoteError('No version selected')
      return
    }

    if (status === 'broken' && !selectedCategory) {
      setVoteError('Please select an issue category')
      return
    }

    setIsSubmitting(true)
    setVoteError(null)

    try {
      const payload = {
        version_id: version.id,
        status,
        source: 'human',
        session_id: sessionId
      }

      if (status === 'broken') {
        payload.category = selectedCategory
      }

      const response = await fetch(`${API_URL}/api/vote/human`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setVoteError('You have already voted for this version')
        } else if (response.status === 429) {
          setVoteError('Too many requests. Please wait before voting again.')
        } else {
          setVoteError(data.error || 'Failed to submit vote')
        }
        return
      }

      setSubmitted(true)
      setSelectedStatus(status)
      
      if (onVoteSuccess) {
        onVoteSuccess()
      }

      setTimeout(() => {
        setSubmitted(false)
        setSelectedStatus(null)
        setSelectedCategory('')
      }, 3500)

    } catch (err) {
      setVoteError('Network error. Please try again.')
      console.error('Vote submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVoteReset = () => {
    setSelectedStatus(null)
    setSelectedCategory('')
    setVoteError(null)
    setSubmitted(false)
  }

  return (
    <div className="hero-dashboard">
      <div className="hero-grid">
        {/* Left: Status Score */}
        <div className="hero-section hero-score">
          <div className={`score-card ${scoreState ? 'safe' : 'caution'}`}>
            <div className="score-header">
              <span className="score-icon">
                {scoreState ? '✓' : '⚠'}
              </span>
              <span className="score-status">{status?.status || 'Loading...'}</span>
            </div>
            
            {totalVotes < 5 ? (
              <div className="score-low-data">
                <span>📊 Insufficient data</span>
              </div>
            ) : (
              <div className="score-main">
                <span className="score-number">{score}%</span>
                <span className="score-label">Safe to Upgrade</span>
              </div>
            )}
          </div>
          
          <div className="score-stats">
            <div className="score-stat">
              <span className="score-stat-value">{totalVotes}</span>
              <span className="score-stat-label">Votes</span>
            </div>
            <div className="score-stat">
              <span className="score-stat-value safe">{safeVotes}</span>
              <span className="score-stat-label">Safe</span>
            </div>
            <div className="score-stat">
              <span className="score-stat-value broken">{brokenVotes}</span>
              <span className="score-stat-label">Broken</span>
            </div>
            <div className="score-stat">
              <span className="score-stat-value">{activeAgents}</span>
              <span className="score-stat-label">Agents</span>
            </div>
          </div>
          
          {version && (
            <div className="version-badge">
              {version.version_str}
              {version.is_new && <span className="new-badge">🔥 New</span>}
            </div>
          )}
        </div>

        {/* Center: Lobster Tightrope */}
        <div className="hero-section hero-lobster">
          <div className="lobster-visualization">
            <svg viewBox="0 0 200 100" className="lobster-svg">
              {/* Tightrope */}
              <line x1="10" y1="50" x2="190" y2="50" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
              
              {/* Supports */}
              <line x1="10" y1="50" x2="10" y2="90" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
              <line x1="190" y1="50" x2="190" y2="90" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />

              {/* Lobster */}
              <g transform={`translate(100, 50) ${!scoreState ? 'rotate(35) translateY(20)' : ''}`}>
                {/* Body */}
                <ellipse cx="0" cy="-3" rx="12" ry="7" fill="var(--coral-bright)" />
                
                {/* Head */}
                <circle cx="10" cy="-5" r="6" fill="var(--coral-bright)" />
                
                {/* Eyes */}
                <circle cx="13" cy="-8" r="1.5" fill="#050810" />
                <circle cx="13.5" cy="-8.5" r="1" fill="#00e5cc" />
                
                {/* Antennae */}
                <path d="M 8 -9 Q 5 -15 2 -19" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
                <path d="M 14 -9 Q 17 -15 20 -19" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
                
                {/* Claws */}
                <path d="M -6 -3 Q -12 -7 -15 -11" stroke="var(--coral-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M 4 -3 Q 10 -7 13 -11" stroke="var(--coral-bright)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                
                {/* Legs */}
                <path d="M -5 3 Q -7 8 -9 10" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
                <path d="M -2 3 Q -3 8 -4 10" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
                <path d="M 2 3 Q 3 8 4 10" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
                <path d="M 5 3 Q 7 8 9 10" stroke="var(--coral-bright)" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            </svg>
            
            <div className="lobster-status">
              <span className={`status-dot ${scoreState ? 'safe' : 'broken'}`}>
                {scoreState ? '🟢' : '🔴'}
              </span>
              <span className="status-text">{scoreState ? 'Balancing' : 'Fallen'}</span>
              {score !== null && (
                <span className="status-score">{score}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Vote Buttons */}
        <div className="hero-section hero-vote">
          {!submitted ? (
            <div className="vote-form-mini">
              <div className="vote-options-mini">
                <button
                  className={`vote-btn-mini safe ${selectedStatus === 'safe' ? 'selected' : ''}`}
                  onClick={() => handleSubmitVote('safe')}
                  disabled={isSubmitting}
                >
                  <span className="vote-icon">🟢</span>
                  <span className="vote-label">Safe</span>
                </button>

                <button
                  className={`vote-btn-mini broken ${selectedStatus === 'broken' ? 'selected' : ''}`}
                  onClick={() => setSelectedStatus('broken')}
                  disabled={isSubmitting}
                >
                  <span className="vote-icon">🔴</span>
                  <span className="vote-label">Broken</span>
                </button>
              </div>

              {selectedStatus === 'broken' && (
                <div className="category-mini">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select-mini"
                  >
                    <option value="">Select issue...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <button
                    className="submit-mini"
                    onClick={() => handleSubmitVote('broken')}
                    disabled={isSubmitting || !selectedCategory}
                  >
                    {isSubmitting ? '...' : 'Submit'}
                  </button>
                </div>
              )}

              {voteError && (
                <div className="vote-error">
                  <span>⚠️</span>
                  <span>{voteError}</span>
                  <button onClick={handleVoteReset}>✕</button>
                </div>
              )}
            </div>
          ) : (
            <div className="vote-success">
              <span className="success-icon">
                {selectedStatus === 'safe' ? '🟢' : '📝'}
              </span>
              <span className="success-text">Vote recorded!</span>
              <span className="success-time">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top issue preview */}
      {issues && issues.length > 0 && issues[0]?.count > 0 && (
        <div className="top-issue-preview">
          <span className="issue-label">Top Issue:</span>
          <span className="issue-name">{issues[0].category}</span>
          <span className="issue-percentage">({issues[0].percentage?.toFixed(0)}%)</span>
        </div>
      )}

      <style>{`
        .hero-dashboard {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto 1.5rem;
          padding: 0 1rem;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr;
          gap: 1rem;
          align-items: stretch;
        }

        .hero-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        /* Score Section */
        .hero-score .score-card {
          background: var(--surface-card);
          border: 2px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.25s ease;
        }

        .hero-score .score-card.safe {
          border-color: var(--cyan-bright);
        }

        .hero-score .score-card.caution {
          border-color: var(--coral-mid);
        }

        .score-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .score-icon {
          font-size: 1.5rem;
        }

        .score-status {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .score-low-data {
          color: var(--text-muted);
          font-style: italic;
          padding: 0.75rem;
          background: var(--bg-elevated);
          border-radius: 0.5rem;
        }

        .score-main {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .score-number {
          font-size: 3.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .score-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .score-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .score-stat {
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          padding: 0.5rem;
          text-align: center;
        }

        .score-stat-value {
          display: block;
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .score-stat-value.safe {
          color: var(--cyan-bright);
        }

        .score-stat-value.broken {
          color: var(--coral-bright);
        }

        .score-stat-label {
          display: block;
          font-size: 0.625rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .version-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--surface-interactive);
          border: 1px solid var(--border-subtle);
          border-radius: 999px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .new-badge {
          font-size: 0.75rem;
        }

        /* Lobster Section */
        .hero-lobster {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lobster-visualization {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
        }

        .lobster-svg {
          width: 100%;
          max-width: 280px;
          height: auto;
        }

        .lobster-status {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--surface-card-strong);
          border: 1px solid var(--border-subtle);
          border-radius: 999px;
        }

        .status-dot {
          font-size: 1.25rem;
        }

        .status-text {
          font-weight: 600;
          font-size: 0.8125rem;
          color: var(--text-primary);
        }

        .status-score {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--coral-bright);
          background: var(--surface-coral-soft);
          padding: 0.125rem 0.5rem;
          border-radius: 0.375rem;
        }

        /* Vote Section */
        .hero-vote {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vote-form-mini {
          width: 100%;
        }

        .vote-options-mini {
          display: flex;
          gap: 0.5rem;
        }

        .vote-btn-mini {
          flex: 1;
          padding: 0.875rem 0.75rem;
          border: 2px solid var(--border-subtle);
          border-radius: 0.75rem;
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .vote-btn-mini:hover:not(:disabled) {
          border-color: var(--border-accent);
          transform: translateY(-1px);
        }

        .vote-btn-mini.selected {
          border-color: var(--coral-bright);
          background: var(--surface-coral-soft);
        }

        .vote-btn-mini:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .vote-btn-mini.safe:hover:not(:disabled) {
          border-color: var(--cyan-bright);
        }

        .vote-btn-mini.broken:hover:not(:disabled) {
          border-color: var(--coral-bright);
        }

        .vote-icon {
          font-size: 1.5rem;
        }

        .vote-label {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .category-mini {
          margin-top: 0.75rem;
          display: flex;
          gap: 0.5rem;
        }

        .category-select-mini {
          flex: 1;
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          background: var(--surface-card-strong);
          color: var(--text-primary);
          font-size: 0.8125rem;
          cursor: pointer;
        }

        .category-select-mini:focus {
          outline: none;
          border-color: var(--coral-bright);
        }

        .submit-mini {
          padding: 0.625rem 1rem;
          background: var(--coral-bright);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-mini:hover:not(:disabled) {
          background: var(--coral-mid);
        }

        .submit-mini:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .vote-error {
          margin-top: 0.75rem;
          background: var(--surface-coral-soft);
          border: 1px solid var(--border-accent);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--text-primary);
        }

        .vote-error button {
          background: none;
          border: none;
          color: var(--coral-bright);
          cursor: pointer;
          font-weight: 600;
          padding: 0 0.25rem;
        }

        .vote-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 1rem;
          background: var(--surface-coral-soft);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          text-align: center;
        }

        .success-icon {
          font-size: 1.75rem;
        }

        .success-text {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .success-time {
          font-size: 0.6875rem;
          color: var(--text-muted);
        }

        /* Top Issue Preview */
        .top-issue-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.5rem 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          font-size: 0.8125rem;
        }

        .issue-label {
          color: var(--text-muted);
        }

        .issue-name {
          color: var(--text-primary);
          font-weight: 600;
        }

        .issue-percentage {
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr 1fr;
          }

          .hero-section:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
          }

          .score-number {
            font-size: 2.5rem;
          }

          .score-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .lobster-svg {
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  )
}

export default HeroDashboard
