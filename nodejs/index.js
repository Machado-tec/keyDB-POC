const express = require('express');
const redis = require('redis');

const app = express();
const port = 80;

// Create a Redis client
const redisClient = redis.createClient({
  host: 'keydb_01', // Adjust this according to your environment
  port: 6379
});

// Middleware to parse JSON
app.use(express.json());

// Endpoint to handle interval decrease
app.post('/decrease-interval', (req, res) => {
  redisClient.get('update_interval', (err, interval) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving interval' });
    } else {
      let newInterval = Math.max(1, parseInt(interval) - 1); // Minimum interval is 1 second
      redisClient.set('update_interval', newInterval);
      res.json({ interval: newInterval });
    }
  });
});

// SSE route for real-time events
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send updates every time the shared_key is updated
  const intervalId = setInterval(() => {
    redisClient.get('shared_key', (err, value) => {
      if (err) {
        console.error('Error fetching shared_key:', err);
      } else {
        res.write(`data: ${value}\n\n`);
      }
    });
  }, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// Basic homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});