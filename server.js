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

// Middleware to handle incoming token from the authentication service
function receiveToken(req, res, next) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token not provided.' });
  }

  jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ error: 'Invalid token.' });
    }

    // Extract the developer information (e.g., public key) from the token's payload
    const developerPublicKey = decoded.sub;

    // Associate the developer information with the request for future reference
    req.developerPublicKey = developerPublicKey;

    next();
  });
}

// In-memory tasks array
let tasks = [];

// Add a new task (protected route, requires token verification)
app.post('/api/tasks', receiveToken, (req, res) => {
  const { task } = req.body;

  // Use the developer public key associated with the request
  const developerPublicKey = req.developerPublicKey;

  tasks.push({ task, developer: developerPublicKey });
  res.status(201).json({ message: 'Task added successfully!' });
});

// Get all tasks (protected route, requires token verification)
app.get('/api/tasks', receiveToken, (req, res) => {
  res.json(tasks);
});

// Update the listening address to 0.0.0.0 to make the server accessible to other services within the cluster
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Backend service is running on http://${host}:${port}`);
});
