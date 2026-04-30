import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Load API routes (now a .cjs file, so we use default import)
const apiRoutes = (await import('./src/routes/api.cjs')).default;

// Mount the API routes
app.use('/api', apiRoutes(io));

// Serve static files from the built React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// Handle React routing: return index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API + WebSocket available`);
});
