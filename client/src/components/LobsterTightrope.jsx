function LobsterTightrope({ status, className = '' }) {
  // Status is 0-100 score
  const isSafe = status >= 70
  const score = status ?? 0

  return (
    <div className={`lobster-container ${className}`}>
      <svg viewBox="0 0 400 200" className="lobster-svg">
        {/* Tightrope */}
        <line x1="20" y1="100" x2="380" y2="100" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Supports */}
        <line x1="20" y1="100" x2="20" y2="180" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />
        <line x1="380" y1="100" x2="380" y2="180" stroke="var(--border-subtle)" strokeWidth="2" strokeLinecap="round" />

        {/* Lobster - flat, minimal design */}
        <g transform={`translate(200, 100) ${!isSafe ? 'rotate(35) translateY(40)' : ''}`}>
          {/* Body */}
          <ellipse cx="0" cy="-5" rx="24" ry="14" fill="var(--coral-bright)" />
          
          {/* Head */}
          <circle cx="20" cy="-10" r="12" fill="var(--coral-bright)" />
          
          {/* Eyes */}
          <circle cx="25" cy="-16" r="3" fill="#050810" />
          <circle cx="26" cy="-17" r="1.5" fill="#00e5cc" />
          
          {/* Antennae */}
          <path d="M 16 -18 Q 10 -30 4 -38" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 28 -18 Q 34 -30 40 -38" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
          
          {/* Claws */}
          <path d="M -12 -5 Q -24 -12 -30 -20" stroke="var(--coral-bright)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 8 -5 Q 20 -12 26 -20" stroke="var(--coral-bright)" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Legs */}
          <path d="M -10 5 Q -14 15 -18 20" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M -3 5 Q -6 15 -9 20" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 4 5 Q 6 15 9 20" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 11 5 Q 14 15 18 20" stroke="var(--coral-bright)" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      {/* Status indicator */}
      <div className="lobster-status">
        <span className={`status-indicator ${isSafe ? 'safe' : 'broken'}`}>
          {isSafe ? '🟢' : '🔴'}
        </span>
        <span className="status-label">
          {isSafe ? 'Balancing' : 'Fallen'}
        </span>
        {status !== null && (
          <span className="status-score">
            {status}%
          </span>
        )}
      </div>

      <style>{`
        .lobster-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
        }

        .lobster-svg {
          width: 100%;
          max-width: 400px;
          height: auto;
        }

        .lobster-status {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: var(--surface-card-strong);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
        }

        .status-indicator {
          font-size: 1.5rem;
        }

        .status-label {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .status-score {
          font-weight: 700;
          font-size: 1rem;
          color: var(--coral-bright);
          background: var(--surface-coral-soft);
          padding: 0.25rem 0.625rem;
          border-radius: 0.5rem;
        }

        @media (max-width: 640px) {
          .lobster-container {
            padding: 1.5rem 0.75rem;
          }

          .lobster-svg {
            max-width: 300px;
          }

          .lobster-status {
            padding: 0.625rem 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default LobsterTightrope
