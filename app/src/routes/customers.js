const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /customers - Danh sách khách hàng
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, COUNT(b.id) as booking_count,
             COALESCE(SUM(b.total_price), 0) as total_spent
      FROM customers c
      LEFT JOIN bookings b ON c.id = b.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.render('customers/index', {
      title: 'Quản Lý Khách Hàng - TourViet',
      customers: result.rows,
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

module.exports = router;
