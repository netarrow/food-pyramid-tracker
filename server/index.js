import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
