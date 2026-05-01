function PlatformTabs({ current, onChange }) {
  const platforms = [
    { id: 'global', label: 'Global', icon: '🌍' },
    { id: 'linux', label: 'Linux', icon: '🐧' },
    { id: 'macos', label: 'macOS', icon: '🍎' },
    { id: 'windows', label: 'Windows', icon: '🪟' },
    { id: 'docker', label: 'Docker', icon: '🐳' }
  ]

  return (
    <div className="platform-tabs">
      <div className="tabs-container">
        {platforms.map(platform => (
          <button
            key={platform.id}
            className={`tab ${current === platform.id ? 'active' : ''}`}
            onClick={() => onChange(platform.id)}
          >
            <span className="tab-icon">{platform.icon}</span>
            <span className="tab-label">{platform.label}</span>
            {current === platform.id && (
              <div className="tab-indicator" />
            )}
          </button>
        ))}
      </div>

      <style>{`
        .platform-tabs {
          margin-bottom: 2rem;
          width: 100%;
          max-width: 1000px;
          margin-left: auto;
          margin-right: auto;
        }

        .tabs-container {
          display: flex;
          gap: 0.375rem;
          background: var(--bg-elevated);
          padding: 0.375rem;
          border-radius: 0.875rem;
          overflow-x: auto;
          scrollbar-width: thin;
          border: 1px solid var(--border-subtle);
          position: relative;
        }

        .tabs-container::-webkit-scrollbar {
          height: 4px;
        }

        .tabs-container::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 2px;
        }

        .tab {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: none;
          background: transparent;
          border-radius: 0.625rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
        }

        .tab:hover {
          background: var(--surface-interactive);
        }

        .tab.active {
          background: var(--coral-bright);
          color: white;
        }

        .tab-icon {
          font-size: 1.125rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .tab-label {
          font-weight: 600;
        }

        .tab-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: white;
          border-radius: 3px 3px 0 0;
          opacity: 0.3;
        }

        .tabs-container {
          scroll-behavior: smooth;
        }

        .tab:focus-visible {
          outline: 2px solid var(--cyan-bright);
          outline-offset: 2px;
          border-radius: 0.625rem;
        }

        @media (max-width: 640px) {
          .tab {
            padding: 0.5rem 0.875rem;
            font-size: 0.8125rem;
            gap: 0.375rem;
          }

          .tab-icon {
            font-size: 1rem;
          }

          .tab-label {
            display: none;
          }

          .tabs-container {
            padding: 0.25rem;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default PlatformTabs
