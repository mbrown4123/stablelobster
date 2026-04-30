const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const apiRoutes = require('./src/routes/api.js');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Attach io to global scope so api.js can access it via global.io
global.io = io;

// Mount the API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API + WebSocket available`);
});
