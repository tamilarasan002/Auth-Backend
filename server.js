// backend/index.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const authServerURL = 'http://localhost:5001';

function authenticateToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(401);
  }

  axios
    .post(`${authServerURL}/verify-token`, { token })
    .then((response) => {
      if (response.data.valid) {
        req.user = response.data.decoded.sub;
        console.log('User authorized:', req.user);
        next();
      } else {
        console.error('Token verification failed:', response.data.error);
        res.sendStatus(403);
      }
    })
    .catch((err) => {
      console.error('Error verifying token:', err.message);
      res.sendStatus(500);
    });
}

app.get('/api/tasks', authenticateToken, (req, res) => {
  // Replace this with your actual implementation to fetch tasks
  const tasks = [{ id: 1, title: 'Task 1' }, { id: 2, title: 'Task 2' }];
  res.json(tasks);
});

const port = 4000;
app.listen(port, () => {
  console.log(`Backend service is running on http://localhost:${port}`);
});
