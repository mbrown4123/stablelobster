require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const { initDB } = require('./src/database');
const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');
const { initGithubCron } = require('./src/cron/github');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.WS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Global io reference for cron jobs
global.io = io;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Mount routes
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Serve static files from client build
app.use(express.static(path.join(__dirname, 'client/dist')));

// API Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('subscribe', (channel) => {
    console.log(`Client ${socket.id} subscribed to ${channel}`);
    socket.join(channel);
  });

  socket.on('unsubscribe', (channel) => {
    socket.leave(channel);
  });
});

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;

// Initialize database first, then start server
initDB().then(() => {
  console.log('Database initialized successfully');
  
  server.listen(PORT, () => {
    console.log(`
╭──────────────────────────────────────────╮
│         StableLobster Server              │
│                                          │
│  🦞 Listening on port ${PORT}              │
│  🌐 Environment: ${process.env.NODE_ENV || 'development'}        │
│  🔌 WebSocket: enabled                   │
│  📡 GitHub sync: every 15 min            │
╰──────────────────────────────────────────╯
  `);
  });

  // Initialize GitHub cron job after database is ready
  initGithubCron();
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = { app, server, io };
