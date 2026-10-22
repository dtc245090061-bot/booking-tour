const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /tours - Danh sách tất cả tour
router.get('/', async (req, res) => {
  try {
    const { destination, minPrice, maxPrice } = req.query;
    let query = 'SELECT * FROM tours WHERE 1=1';
    const params = [];
    if (destination) {
      params.push(`%${destination}%`);
      query += ` AND destination ILIKE $${params.length}`;
    }
    if (minPrice) {
      params.push(minPrice);
      query += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      query += ` AND price <= $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    res.render('tours/index', {
      title: 'Danh Sách Tour - TourViet',
      tours: result.rows,
      filters: req.query,
    });
  } catch (err) {
    console.error('Error fetching tours:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

// GET /tours/:id - Chi tiết tour
router.get('/:id', async (req, res) => {
  try {
    const tourResult = await db.query('SELECT * FROM tours WHERE id = $1', [req.params.id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).render('404', { title: 'Không tìm thấy tour' });
    }
    const schedulesResult = await db.query(
      'SELECT * FROM schedules WHERE tour_id = $1 AND departure_date >= CURRENT_DATE AND available_slots > 0 ORDER BY departure_date',
      [req.params.id]
    );
    res.render('tours/detail', {
      title: `${tourResult.rows[0].name} - TourViet`,
      tour: tourResult.rows[0],
      schedules: schedulesResult.rows,
    });
  } catch (err) {
    console.error('Error fetching tour detail:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

module.exports = router;
