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
    origin: "*", // Allow all for now. Lock this down later for production!
    methods: ["GET", "POST"]
  }
});

// Serve static files from the built React app
// IMPORTANT: Run 'npm run build' in client/ first
app.use(express.static(path.join(__dirname, 'client/dist')));

// Your API routes go here (or import them from ./routes/api.js)
// Example:
// app.use('/api', apiRoutes);

// Handle React routing: return index.html for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`API + WebSocket available\`);
});
