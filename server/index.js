/* global process */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = Number(process.env.PORT) || 80;
const isProduction = process.env.NODE_ENV === 'production';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(__dirname, '../dist');

app.use(cors());
app.use(bodyParser.json());

// In-memory stick data store
let logs = [];

async function setupServer() {
  // API Routes (Always active)
  app.get('/api/logs', (req, res) => {
    res.json(logs);
  });
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'food-pyramid-tracker',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
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
    // Production: serve static files from /dist
    console.log(`Running in PRODUCTION mode (serving static files from ${distPath})`);
    app.use(express.static(distPath));

    // SPA fallback
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Development: use Vite middleware
    console.log('Running in DEVELOPMENT mode (using Vite middleware)');
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: clientRoot
    });

    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`);
  });
}

setupServer();
