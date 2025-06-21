const session = require('express-session');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use('/', require('./routes/index'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

// serve views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Export the app instead of listening here
module.exports = app;