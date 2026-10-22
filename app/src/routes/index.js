const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Trang chủ - hiển thị các tour nổi bật
router.get('/', async (req, res) => {
  try {
    const toursResult = await db.query(
      'SELECT * FROM tours ORDER BY created_at DESC LIMIT 6'
    );
    const statsResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM tours) as total_tours,
        (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed') as total_bookings,
        (SELECT COUNT(*) FROM customers) as total_customers
    `);
    res.render('index', {
      title: 'TourViet - Khám Phá Việt Nam',
      tours: toursResult.rows,
      stats: statsResult.rows[0],
    });
  } catch (err) {
    console.error('Error on index route:', err);
    res.render('index', { title: 'TourViet - Khám Phá Việt Nam', tours: [], stats: {} });
  }
});

module.exports = router;
