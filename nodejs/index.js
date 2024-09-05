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

// Endpoint to get the current interval for keydb_01
app.get('/get-interval', (req, res) => {
  redisClient1.get('update_interval', (err, interval) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving interval' });
    } else {
      res.json({ interval: interval ? parseInt(interval) : 10 });
    }
  });
});

// Endpoint to handle interval decrease for keydb_01
app.post('/decrease-interval', (req, res) => {
  redisClient1.get('update_interval', (err, interval) => {
    if (err) {
      res.status(500).json({ error: 'Error retrieving interval' });
    } else {
      let currentInterval = parseInt(interval) || 10;
      let newInterval = currentInterval === 1 ? 10 : currentInterval - 1;
      redisClient1.set('update_interval', newInterval);
      res.json({ newInterval });
    }
  });
});

// SSE route for real-time updates from keydb_01, keydb_02, and keydb_03
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Function to send updates from all three KeyDB instances
  const sendUpdates = () => {
    // Get data from keydb_01
    redisClient1.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_01:', err);
      } else {
        const [sharedKey1, interval1] = values;
        res.write(`data: keydb_01: ${sharedKey1} (Interval: ${interval1 || 10})\n\n`);
      }
    });

    // Get data from keydb_02
    redisClient2.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_02:', err);
      } else {
        const [sharedKey2, interval2] = values;
        res.write(`data: keydb_02: ${sharedKey2} (Interval: ${interval2 || 10})\n\n`);
      }
    });

    // Get data from keydb_03
    redisClient3.mget(['shared_key', 'update_interval'], (err, values) => {
      if (err) {
        console.error('Error fetching values from keydb_03:', err);
      } else {
        const [sharedKey3, interval3] = values;
        res.write(`data: keydb_03: ${sharedKey3} (Interval: ${interval3 || 10})\n\n`);
      }
    });
  };

  // Send updates every second
  const intervalId = setInterval(sendUpdates, 1000);

  // Clean up when the client disconnects
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
  });
});

// Serve the front-end HTML page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Node.js app listening on port ${port}`);
});