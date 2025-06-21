const session = require('express-session');
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const indexRoutes = require('./routes/index'); //

app.use('/', indexRoutes);
app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Static files come last so / doesn't get hijacked by index.html
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;
