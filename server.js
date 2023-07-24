const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const port = 4000;
const app = express();

const publicKey = fs.readFileSync('public_key.pem'); // Load the public key from file

// Set up CORS with the frontend URL
app.use(cors({ origin: process.env.MY_FRONTEND_URL }));

app.use(bodyParser.json());

// Authentication middleware to validate the token
function authenticateToken(req, res, next) {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token not provided.' });
  }

  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.sendStatus(403);
    }

    // Extract the subject (sub) from the token's payload
    const sub = decoded.sub;

    // Associate the subject with the request for future reference
    req.sub = sub;

    next();
  });
}

// In-memory tasks array
let tasks = [];

// Add a new task (protected route, requires token validation)
app.post('/api/tasks', authenticateToken, (req, res) => {
  const { task } = req.body;

  // Use the subject (sub) associated with the request
  const sub = req.sub;

  tasks.push({ task, developer: sub });
  res.status(201).json({ message: 'Task added successfully!' });
});

// Get all tasks (protected route, requires token validation)
app.get('/api/tasks', authenticateToken, (req, res) => {
  res.json(tasks);
});

// Update the listening address to 0.0.0.0 to make the server accessible to other services within the cluster
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Backend service is running on http://${host}:${port}`);
});
