const express = require('express');
const redis = require('redis');

const app = express();
const port = 80;

// Create Redis clients for keydb_01, keydb_02, and keydb_03
const redisClient1 = redis.createClient({ host: 'keydb_01', port: 6379 });
const redisClient2 = redis.createClient({ host: 'keydb_02', port: 6379 });
const redisClient3 = redis.createClient({ host: 'keydb_03', port: 6379 });

// Middleware to parse JSON
app.use(express.json());

// Endpoint to change interval for any keydb instance
app.post('/change-interval/:keydb', (req, res) => {
  let redisClient;
  switch (req.params.keydb) {
    case 'keydb_01':
      redisClient = redisClient1;
      break;
    case 'keydb_02':
      redisClient = redisClient2;
      break;
    case 'keydb_03':
      redisClient = redisClient3;
      break;
    default:
      return res.status(400).json({ error: 'Invalid KeyDB instance' });
  }

  redisClient.get('update_interval', (err, interval) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving interval' });
    } else {
      let currentInterval = parseInt(interval) || 10;
      let newInterval = currentInterval === 1 ? 10 : currentInterval - 1;
      redisClient.set('update_interval', newInterval);
      res.json({ newInterval });
    }
  });
});

// SSE route for real-time events from keydb_01, keydb_02, and keydb_03
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendUpdates = () => {
    redisClient1.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_01:', err);
      } else {
        const [sharedKey1, interval1] = values;
        res.write(`data: keydb_01: ${sharedKey1} (Interval: ${interval1 || 10})\n\n`);
      }
    });

    redisClient2.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_02:', err);
      } else {
        const [sharedKey2, interval2] = values;
        res.write(`data: keydb_02: ${sharedKey2} (Interval: ${interval2 || 10})\n\n`);
      }
    });

    redisClient3.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_03:', err);
      } else {
        const [sharedKey3, interval3] = values;
        res.write(`data: keydb_03: ${sharedKey3} (Interval: ${interval3 || 10})\n\n`);
      }
    });
  };

  const intervalId = setInterval(sendUpdates, 1000);

  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// Basic homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});