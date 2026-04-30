import { useEffect, useState } from 'react'

function Header({ connected, releaseType, onReleaseTypeChange }) {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    setMounted(true)
    // Read current theme
    const saved = localStorage.getItem('oc-theme') || 'dark'
    setTheme(saved)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.dataset.theme = newTheme
    document.documentElement.style.colorScheme = newTheme
    localStorage.setItem('oc-theme', newTheme)
  }

  return (
    <header className={`header ${mounted ? 'animate-fade-in' : ''}`}>
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Switch color theme"
      >
        <span className="theme-toggle-icon">
          {theme === 'dark' ? '☀️' : '🌙'}
        </span>
      </button>
      
      <div className="header-content">
        <div className="logo">
          🦞
        </div>
        
        <div className="title-section">
          <h1>StableLobster</h1>
          <p className="subtitle">The Consumer Reports for AI Agents</p>
        </div>

        <div className="header-actions">
          {/* Release Type Pill Navigation */}
          <div className="release-type-pill">
            <button
              className={`pill-tab ${releaseType === 'major' ? 'active' : ''}`}
              onClick={() => onReleaseTypeChange('major')}
              aria-pressed={releaseType === 'major'}
            >
              Major Releases
            </button>
            <button
              className={`pill-tab ${releaseType === 'beta' ? 'active' : ''}`}
              onClick={() => onReleaseTypeChange('beta')}
              aria-pressed={releaseType === 'beta'}
            >
              Beta
            </button>
            <div 
              className={`pill-indicator ${releaseType === 'major' ? 'left' : 'right'}`}
            />
          </div>



          <div className="connection-status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            <span className="status-text">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <style>{`
        .header {
          background: var(--surface-card);
          border-bottom: 1px solid var(--border-subtle);
          padding: 1.5rem 1.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
        }

        .theme-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          z-index: 1000;
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          padding: 0;
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
          background: var(--surface-card-strong);
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
        }

        .theme-toggle:hover {
          border-color: var(--border-accent);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px color-mix(in srgb, var(--coral-bright) 20%, transparent);
        }

        .theme-toggle-icon {
          font-size: 1.05rem;
          line-height: 1;
          color: var(--text-secondary);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .theme-toggle:hover .theme-toggle-icon {
          color: var(--text-primary);
          transform: rotate(10deg) scale(1.04);
        }

        .header-content {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .logo {
          font-size: 2.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: var(--surface-interactive);
          border-radius: 1rem;
          border: 1px solid var(--border-subtle);
          transition: all 0.2s ease;
        }

        .logo:hover {
          transform: scale(1.05);
          border-color: var(--border-accent);
        }

        .title-section {
          flex: 1;
          text-align: left;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Segmented Pill Navigation */
        .release-type-pill {
          display: flex;
          position: relative;
          background: var(--bg-elevated);
          border: 1px solid var(--border-subtle);
          border-radius: 0.875rem;
          padding: 0.375rem;
          gap: 0.375rem;
        }

        .pill-tab {
          position: relative;
          z-index: 1;
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 0.625rem;
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          white-space: nowrap;
          flex: 1;
          text-align: center;
        }

        .pill-tab:hover {
          color: var(--text-primary);
        }

        .pill-tab.active {
          color: white;
        }

        .pill-indicator {
          position: absolute;
          top: 0.375rem;
          height: calc(100% - 0.75rem);
          width: calc(50% - 0.375rem);
          background: var(--coral-bright);
          border-radius: 0.625rem;
          transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--coral-bright) 30%, transparent);
        }

        .pill-indicator.left {
          left: 0.375rem;
        }

        .pill-indicator.right {
          left: calc(50% + 0px);
        }

        .title-section h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.875rem;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          font-weight: 700;
        }

        .subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.625rem 1.25rem;
          background: var(--surface-card-strong);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .connection-status:hover {
          border-color: var(--border-accent);
          transform: translateY(-1px);
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .status-dot.connected {
          background: var(--cyan-bright);
        }

        .status-dot.disconnected {
          background: var(--coral-bright);
        }

        .status-text {
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .header {
            padding: 1.25rem 1rem;
          }

          .header-content {
            flex-wrap: wrap;
            justify-content: center;
            text-align: center;
            gap: 1rem;
          }

          .title-section {
            text-align: center;
          }

          .title-section h1 {
            font-size: 1.5rem;
          }

          .header-actions {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .release-type-pill {
            width: 100%;
            max-width: 280px;
          }

          .connection-status {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .theme-toggle {
            top: 10px;
            right: 10px;
            width: 36px;
            height: 36px;
          }

          .logo {
            width: 56px;
            height: 56px;
            font-size: 2.25rem;
          }

          .title-section h1 {
            font-size: 1.375rem;
          }

          .subtitle {
            font-size: 0.8125rem;
          }

          .pill-tab {
            padding: 0.4rem 0.625rem;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  )
}

export default Header
