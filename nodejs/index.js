const express = require('express');
const redis = require('redis');

const app = express();
const port = 80;

// Create a Redis client
const redisClient = redis.createClient({
  host: 'keydb_01', // Adjust this according to your environment
  port: 6379
});

// Handle connection errors
redisClient.on('error', (err) => {
  console.log('Redis error:', err);
});

// Subscriber for keyspace notifications
const subscriber = redisClient.duplicate();

// Listen to keyspace events for the 'set' operation
subscriber.subscribe('__keyevent@0__:set');

let latestMessage = 'No updates yet'; // Store the latest message

subscriber.on('message', (channel, message) => {
  console.log(`Received message: ${message} on channel: ${channel}`);
  redisClient.get('shared_key', (err, value) => {
    if (err) {
      console.error('Error fetching shared_key:', err);
    } else {
      latestMessage = `Updated key: ${message}, Value: ${value}`;
      console.log(latestMessage); // Log the message for debugging
    }
  });
});

// SSE Route
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send updates every time the shared_key is updated
  const intervalId = setInterval(() => {
    res.write(`data: ${latestMessage}\n\n`);
  }, 1000);

  // Close the connection if the client disconnects
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

