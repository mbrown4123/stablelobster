function LobsterTightrope({ status, className = '' }) {
  // Status is 0-100 score
  const isSafe = status >= 70
  const score = status ?? 0

  return (
    <div className={`lobster-container ${className}`}>
      {/* Video only: centered, always straight */}
      <div className="lobster-video-wrapper">
        <video
          key={isSafe ? 'stable' : 'unstable'}
          src={isSafe ? '/lobster-fallback.mp4' : '/lobster-unstable.mp4'}
          autoPlay
          loop
          muted
          playsInline
          className="lobster-video"
        />
      </div>

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

        .lobster-video-wrapper {
          position: relative;
          width: auto;
          height: auto;
          margin: 0 auto;
        }

        .lobster-video {
          width: auto;
          height: 90px;
          display: block;
          border-radius: 8px;
          object-fit: contain;
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
