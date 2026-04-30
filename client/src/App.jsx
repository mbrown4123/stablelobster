import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Header from './components/Header'
import StatusCard from './components/StatusCard'
import LobsterTightrope from './components/LobsterTightrope'
import VoteButtons from './components/VoteButtons'
import VersionList from './components/VersionList'
import VoteGraph from './components/VoteGraph'
import IssueBreakdown from './components/IssueBreakdown'
import PlatformTabs from './components/PlatformTabs'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || window.location.origin
const WS_URL = import.meta.env.VITE_WS_URL || window.location.origin

function App() {
  const [versions, setVersions] = useState({})
  const [currentVersion, setCurrentVersion] = useState(null)
  const [status, setStatus] = useState(null)
  const [votes24h, setVotes24h] = useState([])
  const [platform, setPlatform] = useState('global')
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [issues, setIssues] = useState([])
  const [releaseType, setReleaseType] = useState('major') // 'major' or 'beta'

  // Initialize WebSocket
  useEffect(() => {
    const ws = io(WS_URL, {
      transports: ['websocket', 'polling']
    })

    ws.on('connect', () => {
      console.log('WebSocket connected')
      setConnected(true)
    })

    ws.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    })

    ws.on('vote', (data) => {
      console.log('Vote update received:', data)
      // Refresh status when vote comes in
      fetchStatus(data.version_id)
      fetchVotes24h()
    })

    ws.on('versions_updated', () => {
      console.log('Versions updated')
      fetchVersions()
    })

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [])

  // Fetch versions on mount
  useEffect(() => {
    fetchVersions()
  }, [platform, releaseType])

  // Fetch initial status and graph data
  useEffect(() => {
    if (currentVersion) {
      fetchStatus(currentVersion.id)
      fetchVotes24h()
    }
  }, [currentVersion, platform])

  async function fetchVersions() {
    try {
      const params = new URLSearchParams({ platform })
      const res = await fetch(`${API_URL}/api/versions?${params}`)
      const data = await res.json()
      
      // Filter versions based on release type
      let filteredVersions = { ...data.versions }
      
      if (releaseType === 'major') {
        // Hide beta versions in major releases view
        Object.keys(filteredVersions).forEach(series => {
          filteredVersions[series] = filteredVersions[series].filter(v => {
            const versionStr = v.version_str?.toLowerCase() || ''
            return !versionStr.includes('beta')
          })
        })
      } else if (releaseType === 'beta') {
        // Only show beta versions
        Object.keys(filteredVersions).forEach(series => {
          filteredVersions[series] = filteredVersions[series].filter(v => {
            const versionStr = v.version_str?.toLowerCase() || ''
            return versionStr.includes('beta')
          })
        })
      }
      
      setVersions(filteredVersions)
      
      // Set latest version if none selected
      if (!currentVersion) {
        const allVersions = Object.values(filteredVersions).flat()
        if (allVersions.length > 0) {
          setCurrentVersion(allVersions[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error)
    }
  }

  async function fetchStatus(versionId) {
    try {
      const params = new URLSearchParams({ platform })
      const res = await fetch(`${API_URL}/api/status/${versionId}?${params}`)
      const data = await res.json()
      setStatus(data)
      setIssues(data.issues || [])
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  async function fetchVotes24h() {
    try {
      const params = new URLSearchParams({ 
        version_id: currentVersion?.id,
        platform 
      })
      const res = await fetch(`${API_URL}/api/votes/24h?${params}`)
      const data = await res.json()
      setVotes24h(data.data || [])
    } catch (error) {
      console.error('Failed to fetch 24h votes:', error)
    }
  }

  return (
    <div className="app">
      <Header 
        connected={connected} 
        releaseType={releaseType}
        onReleaseTypeChange={setReleaseType}
      />
      
      <main className="main">
        {/* Platform Tabs */}
        <PlatformTabs 
          current={platform} 
          onChange={setPlatform} 
        />

        {/* Combined Status and Voting Section */}
        <div className="status-vote-row">
          {/* Status Card (Left) */}
          {status && (
            <div className="status-section">
              <StatusCard 
                status={status.status}
                version={currentVersion}
                issues={status.issues || []}
              />
            </div>
          )}

          {/* Vote Buttons (Right) */}
          {currentVersion && (
            <div className="vote-section">
              <VoteButtons 
                versionId={currentVersion.id}
                onSuccess={() => {
                  fetchStatus(currentVersion.id)
                  fetchVotes24h()
                }}
              />
            </div>
          )}
        </div>

        {/* Lobster Tightrope */}
        {status && (
          <div className="mt-6">
            <LobsterTightrope status={status.status?.score ?? 0} />
          </div>
        )}

        {/* 24h Vote Graph */}
        {votes24h.length > 0 && (
          <div className="mt-6">
            <VoteGraph data={votes24h} />
          </div>
        )}

        {/* Issue Breakdown */}
        {issues.length > 0 && (
          <div className="mt-6">
            <IssueBreakdown issues={issues} />
          </div>
        )}

        {/* Version List */}
        <div className="mt-8">
          <VersionList 
            versions={versions}
            currentVersion={currentVersion}
            onSelect={setCurrentVersion}
            releaseType={releaseType}
          />
        </div>
      </main>

      <footer className="footer">
        <p>StableLobster - The Consumer Reports for AI Agents 🦞</p>
        <p className="text-sm">
          Last updated: {new Date().toLocaleString()}
        </p>
      </footer>
    </div>
  )
}

export default App
