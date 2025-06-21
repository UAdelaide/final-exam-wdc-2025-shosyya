const express = require('express');
const router = express.Router();
const db = require('../db');

// Homepage
router.get('/', (req, res) => {
  res.render('index');
});

// Login
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
        res.redirect('/owner-dashboard');
      } else if (rows[0].role === 'walker') {
        res.redirect('/walker-dashboard');
      }
    } else {
      res.send('Wrong username or password');
    }
  } catch (err) {
    console.log('error with login:', err);
    res.status(500).send('error with login');
  }
});

// Logout
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

// Dashboard: Owner
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

// Dashboard: Walker
router.get('/walker-dashboard', (req, res) => {
  res.render('walker-dashboard', {
    username: req.session.user.username
  });
});

// Current user session info for API
router.get('/api/users/me', (req, res) => {
  if (!req.session.user) {
    res.status(401).json({ error: 'Not logged in' });
  } else {
    res.json(req.session.user);
  }
});

module.exports = router;
