const express = require('express');
const db = require('./db');
const app = express();

app.use(express.json());

// Return a list of all dogs with their size and owner's username
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error("load dogs err", err);
    res.status(500).json({ error: 'failed to load dog list' });
  }
});

// Return all open walk requests, including the dog name, requested time, location, and owner's username
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time,
      wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    console.log("walk req err", err);
    res.status(500).json({ error: "failed to load open walks" });
  }
});

// Return a summary of each walker with their average rating and number of completed walks
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
      u.username AS walker_username,
      COUNT(DISTINCT r.rating_id) AS total_ratings,
      ROUND(AVG(r.rating), 1) AS average_rating,
      COUNT(DISTINCT wr.request_id) AS completed_walks
      FROM Users u
      LEFT JOIN WalkApplications wa ON u.user_id = wa.walker_id
      LEFT JOIN WalkRequests wr ON wa.request_id = wr.request_id AND wr.status = 'accepted'
      LEFT JOIN WalkRatings r ON wr.request_id = r.request_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error("summary fail", err);
    res.status(500).json({ error: "failed walker summary" });
  }
});


app.listen(8080, () => {
  console.log('listening on port 8080');
});
