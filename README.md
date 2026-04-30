# StableLobster 🦞

> The Consumer Reports for AI Agents

An ultra-premium, agent-driven crowd-sourced status platform for OpenClaw versions. Reduce failed upgrades by 90% via real-time community consensus.

![StableLobster](avatars/stablelobster_banner.png)

## 🎯 Vision

- **70% Agent voting** (automatic on startup/crash)
- **30% Human voting** (anonymous quick-vote)
- **Zero login**, **zero ads**, **zero fluff**
- Real-time status updates with WebSocket
- Beautiful lobster tightrope visualization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    StableLobster                     │
├─────────────────┬─────────────────┬─────────────────┤
│   Frontend      │     Backend     │     Agent       │
│   (React)       │   (Node.js)     │   (Python)      │
├─────────────────┼─────────────────┼─────────────────┤
│ • Vite + React  │ • Express       │ • Auto-vote     │
│ • Tailwind CSS  │ • SQLite        │ • Offline queue │
│ • Recharts      │ • Socket.io     │ • Hardware ID   │
│ • Framer Motion │ • Cron jobs     │ • HMAC signing  │
└─────────────────┴─────────────────┴─────────────────┘
```

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+
- Python 3.8+
- SQLite

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and set your values

# Start server
npm run dev
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Agent Integration (Optional)
```bash
cd agent

# Install dependencies
pip install requests

# Configure
export STABLELOBSTER_API_URL="http://localhost:3000"

# Test
python stablelobster_client.py --report --version-id 1 --status safe
```

## 📚 API Reference

### POST `/api/vote`
Submit a vote (agent or human).

**Request:**
```json
{
  "install_id": "hashed_install_id",
  "version_id": 123,
  "status": "safe",
  "source": "agent",
  "os": "linux",
  "node_version": "20.10.0",
  "payload_signature": "hmac_signature"
}
```

### GET `/api/status/:version_id`
Get status for a specific version.

**Response:**
```json
{
  "version": { "version_str": "2026.4.1", "series": "2026.4" },
  "status": {
    "score": 94,
    "status": "Safe",
    "color": "🟢",
    "total_votes": 142,
    "last_verified": "2026-04-30T14:30:00Z"
  },
  "issues": [
    { "category": "Config Error", "count": 8, "percentage": 25 }
  ]
}
```

### GET `/api/versions`
List all versions grouped by series.

### POST `/api/vote/human`
Human vote with session management and rate limiting.

## 🛡️ Security

- **Install ID Hashing**: SHA256 with salt
- **Payload Signing**: HMAC for agent votes
- **Rate Limiting**: IP + session token based
- **Zero PII**: No emails, names, or personal data
- **HTTPS only**: All external communication encrypted

## 📦 Deployment

### Bluehost (Recommended)

1. **Upload files** via FTP to `public_html/stablelobster`
2. **Setup Node.js** in cPanel:
   - Node.js version: 18
   - Application root: `public_html/stablelobster`
   - Startup file: `server.js`
3. **Create database** and set path in `.env`
4. **Run build**: `npm run build`
5. **Restart app** from cPanel

### Docker (Alternative)
```bash
docker build -t stablelobster .
docker run -p 3000:3000 -v ./data:/app/data stablelobster
```

### Full VPS Setup
See `deploy/setup.sh` for complete Ubuntu/Debian setup script.

## 📁 Project Structure

```
stablelobster/
├── server.js              # Express server entry
├── package.json           # Backend dependencies
├── .env.example           # Environment template
├── data/                  # SQLite database (gitignored)
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app
│   │   └── index.css      # Styles
│   ├── package.json
│   └── tailwind.config.js
├── agent/                 # Python agent client
│   └── stablelobster_client.py
├── deploy/                # Deployment configs
│   ├── nginx.conf
│   ├── stablelobster.service
│   └── setup.sh
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment | No (default: development) |
| `DB_PATH` | SQLite database path | No |
| `INSTALL_ID_SALT` | Salt for hashing install IDs | **Yes** |
| `ADMIN_PASSWORD_HASH` | SHA256 hash of admin password | **Yes** |
| `GITHUB_TOKEN` | GitHub API token for release scraping | No |
| `WS_ORIGIN` | WebSocket allowed origin | No |

### Generate Admin Password Hash
```bash
node -e "console.log(require('crypto').createHash('sha256').update('your_password').digest('hex'))"
```

### Generate Install ID Salt
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
cd client
npm test

# Integration test
python agent/stablelobster_client.py --process-queue
```

## 📊 Metrics

- **Vote Accuracy**: ≥94% confidence threshold
- **Update Latency**: <1s (WebSocket)
- **Uptime**: 99.9% target
- **Rate Limit**: 10 votes per 15 min per IP

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Submit a PR

## 📄 License

MIT License - See LICENSE file for details

## 🦞 Credits

Built with ❤️ for the OpenClaw community

**Lobster art** by [YourNameHere]

---

**Status**: 🟢 Safe (Agent-driven monitoring active)

*Last updated: 2026-04-30*
