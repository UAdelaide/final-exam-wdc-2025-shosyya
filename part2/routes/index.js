const express = require('express');
const router = express.Router();
const db = require('../models/db');
const path = require('path');

// homepage with login form
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// process login form
router.post('/login', async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND password_hash = ?',
      [username, password]
    );

    if (rows.length > 0) {
      // Save user info in session
      req.session.user = {
        user_id: rows[0].user_id,
        username: rows[0].username,
        role: rows[0].role
      };

      if (rows[0].role === 'owner') {
        res.redirect('/owner-dashboard.html');
      } else if (rows[0].role === 'walker') {
        res.redirect('/walker-dashboard.html');
      } else {
        res.status(403).send('invalid role');
      }
  } catch (err) {
    console.log('error with login:', err);
    res.status(500).send('error with login');
  }
});

// logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log('error with logout:', err);
      res.status(500).send('error with logout');
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/');
    }
  });
});

// dashboard - owner
router.get('/owner-dashboard', async (req, res) => {
  const ownerId = req.session.user.user_id;

  try {
    const [dogs] = await db.execute(
      'SELECT dog_id, name FROM dogs WHERE owner_id = ?',
      [ownerId]
    );

    res.render('owner-dashboard', {
      username: req.session.user.username,
      dogs
    });
  } catch (err) {
    console.log('error with dashboard:', err);
    res.status(500).send('error with dashboard');
  }
});

// dashboard - walker
router.get('/walker-dashboard', (req, res) => {
  res.render('walker-dashboard', {
    username: req.session.user.username
  });
});

// get current user for API
router.get('/api/users/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not logged in' });
  } else {
    res.json(req.session.user);
  }
});

module.exports = router;
