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
      'SELECT * FROM Users WHERE username = ? AND password_hash = ?',
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
    } else {
      res.send('Wrong username or password');
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
      res.redirect('/index.html');
    }
  });
});

// dashboard - owner (only used for owner dog data)
router.get('/owner-dashboard', async (req, res) => {
  const ownerId = req.session.user?.user_id;
  if (!ownerId) {
    return res.redirect('/index.html');
  }

  try {
    const [dogs] = await db.execute(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [ownerId]
    );

    // If you're not injecting data, send static file
    res.sendFile(path.join(__dirname, '../public/owner-dashboard.html'));
  } catch (err) {
    console.log('error with dashboard:', err);
    res.status(500).send('error with dashboard');
  }
});

// dashboard - walker
router.get('/walker-dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/index.html');
  }

  res.sendFile(path.join(__dirname, '../public/walker-dashboard.html'));
});

// get current user for Vue frontend
router.get('/api/users/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not logged in' });
  } else {
    res.json(req.session.user);
  }
});

module.exports = router;
