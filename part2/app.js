const session = require('express-session');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Sessions
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));



// Export the app instead of listening here
module.exports = app;