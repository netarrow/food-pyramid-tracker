import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// In-memory stick data store
let logs = [];

// Get all logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Create a new log
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

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
