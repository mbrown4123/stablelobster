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

        {/* Lobster - replaced with conditional video */}
        <g transform="translate(200, 100)">
          <video
            key={isSafe ? 'stable' : 'unstable'}
            src={isSafe ? '/lobster-fallback.mp4' : '/lobster-unstable.mp4'}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: '70px',
              height: 'auto',
              transform: !isSafe ? 'rotate(35deg) translateY(40px)' : 'none',
              filter: isSafe ? 'none' : 'grayscale(0.2)'
            }}
          />
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
