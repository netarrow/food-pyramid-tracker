/* global process */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.join(__dirname, '..');
const distPath = path.join(clientRoot, 'dist');

const app = express();
const PORT = Number(process.env.PORT) || 80;

app.use(cors());
app.use(bodyParser.json());

// In-memory stick data store
let logs = [];

// --- Environment Setup ---
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  // API Routes (Always active)
  app.get('/api/logs', (req, res) => {
    res.json(logs);
  });

  app.post('/api/logs', (req, res) => {
    const { date, place, foodType } = req.body;
    if (!date || !place || !foodType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newLog = {
      id: Date.now(),
      date,
      place,
      foodType,
      createdAt: new Date()
    };
    
    logs.push(newLog);
    console.log('New Log Added:', newLog);
    res.status(201).json(newLog);
  });


  if (isProduction) {
    // --- PRODUCTION: Serve Static Files ---
    console.log(`Running in PRODUCTION mode. Serving static files from ${distPath}`);
    app.use(express.static(distPath));

    // Catch-all for SPA (Express 5 requires named wildcard)
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // --- DEVELOPMENT: Use Vite Middleware ---
    console.log('Running in DEVELOPMENT mode with Vite middleware');
    const { createServer: createViteServer } = await import('vite');
    
    // Create Vite server in middleware mode and configure the app type as 'spa'
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa', 
      root: clientRoot
    });

    // Use vite's connect instance as middleware
    // If you use your own express router (express.Router()), you should use router.use
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
