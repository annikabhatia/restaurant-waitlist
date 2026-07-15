const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/join', async (req, res) => {
  const { name, phone, partySize } = req.body;

  if (!name || !phone || !partySize) {
    return res.status(400).json({ error: 'Name, phone, and party size are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO waitlist_entries (name, phone, party_size)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, phone, partySize]
    );

    const positionResult = await pool.query(
      `SELECT COUNT(*) FROM waitlist_entries WHERE status = 'waiting'`
    );

    res.status(201).json({
      message: 'Successfully joined the waitlist',
      customer: result.rows[0],
      position: parseInt(positionResult.rows[0].count),
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This phone number is already on the waitlist' });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM waitlist_entries WHERE status = 'waiting' ORDER BY joined_at ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:id/seat', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE waitlist_entries SET status = 'seated' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM waitlist_entries WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer removed', customer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/:id/notify', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM waitlist_entries WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const customer = result.rows[0];
    console.log(`SMS to ${customer.phone}: Hi ${customer.name}, your table is ready!`);
    res.json({ message: 'Notification sent', customer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;