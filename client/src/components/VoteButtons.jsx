import { useState } from 'react'
import { generateSessionToken } from '../utils/session'

const API_URL = import.meta.env.VITE_API_URL || window.location.origin

const CATEGORIES = [
  'Config Error',
  'Gateway Crash',
  'Network/Connectivity',
  'Performance Lag',
  'Other'
]

function VoteButtons({ versionId, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const [sessionId] = useState(() => {
    let token = localStorage.getItem('stablelobster_session')
    if (!token) {
      token = generateSessionToken()
      localStorage.setItem('stablelobster_session', token)
    }
    return token
  })

  const handleSubmit = async (status) => {
    if (!versionId) {
      setError('No version selected')
      return
    }

    if (status === 'broken' && !selectedCategory) {
      setError('Please select an issue category')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const payload = {
        version_id: versionId,
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
          setError('You have already voted for this version')
        } else if (response.status === 429) {
          setError('Too many requests. Please wait before voting again.')
        } else {
          setError(data.error || 'Failed to submit vote')
        }
        return
      }

      setSubmitted(true)
      setSelectedStatus(status)
      
      if (onSuccess) {
        onSuccess()
      }

      setTimeout(() => {
        setSubmitted(false)
        setSelectedStatus(null)
        setSelectedCategory('')
      }, 3500)

    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Vote submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setSelectedStatus(null)
    setSelectedCategory('')
    setError(null)
    setSubmitted(false)
  }

  return (
    <div className="vote-buttons">
      <h3>Report Status</h3>
      
      {!submitted ? (
        <div className="vote-form">
          <div className="status-options">
            <button
              className={`vote-btn safe-btn ${selectedStatus === 'safe' ? 'selected' : ''}`}
              onClick={() => handleSubmit('safe')}
              disabled={isSubmitting}
            >
              <span className="btn-icon">🟢</span>
              <span className="btn-text">Safe</span>
              <span className="btn-subtext">Everything working</span>
            </button>

            <button
              className={`vote-btn broken-btn ${selectedStatus === 'broken' ? 'selected' : ''}`}
              onClick={() => setSelectedStatus('broken')}
              disabled={isSubmitting || selectedStatus === 'broken'}
            >
              <span className="btn-icon">🔴</span>
              <span className="btn-text">Broken</span>
              <span className="btn-subtext">Experiencing issues</span>
            </button>
          </div>

          {selectedStatus === 'broken' && (
            <div className="category-section">
              <label className="category-label">
                What issue are you experiencing?
              </label>
              <select
                className="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Select an issue...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <button
                className="submit-btn"
                onClick={() => handleSubmit('broken')}
                disabled={isSubmitting || !selectedCategory}
              >
                {isSubmitting ? (
                  <span className="submit-loading">
                    <span className="loading-spinner"></span>
                    Submitting...
                  </span>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button onClick={handleReset} className="error-dismiss">
                Dismiss
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="success-message">
          <div className="success-icon">
            {selectedStatus === 'safe' ? '🟢' : '📝'}
          </div>
          <h4>Thanks for your vote!</h4>
          <p>
            {selectedStatus === 'safe' 
              ? 'Your report helps others know this version is stable.'
              : 'Your report helps identify and fix issues.'}
          </p>
          <div className="success-counter">
            Vote recorded at {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}

      <style>{`
        .vote-buttons {
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 2rem;
          width: 100%;
          max-width: 620px;
          margin: 0 auto;
        }

        .vote-buttons h3 {
          margin: 0 0 1.75rem;
          text-align: center;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .vote-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .status-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .vote-btn {
          padding: 1.5rem 1.25rem;
          border: 2px solid var(--border-subtle);
          border-radius: 0.875rem;
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
        }

        .vote-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: var(--border-accent);
          box-shadow: 0 8px 20px var(--shadow-coral-soft);
        }

        .vote-btn.selected {
          border-color: var(--coral-bright);
          background: var(--surface-coral-soft);
        }

        .vote-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .safe-btn:hover:not(:disabled) {
          border-color: var(--cyan-bright);
        }

        .broken-btn:hover:not(:disabled) {
          border-color: var(--coral-bright);
        }

        .btn-icon {
          font-size: 2.25rem;
        }

        .btn-text {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .btn-subtext {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .category-section {
          background: var(--bg-elevated);
          padding: 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-subtle);
        }

        .category-label {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-size: 0.9375rem;
        }

        .category-select {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 0.625rem;
          background: var(--surface-card-strong);
          color: var(--text-primary);
          font-size: 0.9375rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }

        .category-select:focus {
          outline: none;
          border-color: var(--coral-bright);
          box-shadow: 0 0 0 3px var(--surface-coral-soft);
        }

        .submit-btn {
          width: 100%;
          padding: 1rem 1.5rem;
          background: var(--coral-bright);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: var(--coral-mid);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: var(--surface-coral-soft);
          border: 1px solid var(--border-accent);
          border-radius: 0.625rem;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-primary);
        }

        .error-icon {
          font-size: 1.125rem;
        }

        .error-text {
          flex: 1;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .error-dismiss {
          background: none;
          border: none;
          color: var(--coral-bright);
          cursor: pointer;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.8125rem;
        }

        .error-dismiss:hover {
          background: var(--surface-interactive-hover);
        }

        .success-message {
          text-align: center;
          padding: 2.5rem 2rem;
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1.25rem;
          display: inline-block;
        }

        .success-message h4 {
          margin: 0 0 0.75rem;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .success-message p {
          margin: 0 0 1.25rem;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          line-height: 1.5;
        }

        .success-counter {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .status-options {
            grid-template-columns: 1fr;
          }

          .vote-buttons {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default VoteButtons
