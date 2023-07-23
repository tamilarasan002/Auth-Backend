const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const port = 4000;
const app = express();

const secretKey = process.env.SECRET_KEY; // Replace this with your actual secret key

// Set up CORS with the frontend URL
app.use(cors({ origin: process.env.MY_FRONTEND_URL }));

app.use(bodyParser.json());

// Middleware to check if the request is coming from the frontend
function isFrontendRequest(req, res, next) {
  const origin = req.headers.origin;
  const frontendDomain = process.env.MY_FRONTEND_URL; // Use the environment variable directly

  // Compare the request origin with the frontend domain
  if (origin === frontendDomain) {
    // If the request is coming from the frontend, bypass authentication and continue to the next middleware/route
    return next();
  }

  // If the request is not coming from the frontend, proceed with authentication
  authenticateToken(req, res, next);
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secretKey, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.sendStatus(403);
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

// Add a new task (protected route, bypassed for frontend requests)
app.post('/api/tasks', isFrontendRequest, (req, res) => {
  const { task } = req.body;

  // Use the developer public key associated with the request
  const developerPublicKey = req.developerPublicKey;

  tasks.push({ task, developer: developerPublicKey });
  res.status(201).json({ message: 'Task added successfully!' });
});

// Get all tasks (protected route, bypassed for frontend requests)
app.get('/api/tasks', isFrontendRequest, (req, res) => {
  res.json(tasks);
});

// Update the listening address to 0.0.0.0 to make the server accessible to other services within the cluster
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Backend service is running on http://${host}:${port}`);
});
