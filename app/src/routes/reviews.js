const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /reviews - Trang đánh giá chuyến đi
router.get('/', async (req, res, next) => {
  try {
    const reviewsRes = await db.query('SELECT r.*, t.name as tour_name FROM reviews r JOIN tours t ON r.tour_id = t.id ORDER BY r.created_at DESC');
    const toursRes = await db.query('SELECT id, name FROM tours ORDER BY id ASC');
    res.render('reviews/index', {
      title: 'Đánh Giá Chuyến Đi | Khách Hàng Nói Về TourViet',
      reviews: reviewsRes.rows,
      tours: toursRes.rows,
      success: req.query.success === '1',
    });
  } catch (err) {
    next(err);
  }
});

// POST /reviews - Gửi đánh giá mới
router.post('/', async (req, res, next) => {
  try {
    const { tour_id, customer_name, rating, comment, travel_date, redirect_tour } = req.body;
    await db.query(
      'INSERT INTO reviews (tour_id, customer_name, rating, comment, travel_date) VALUES ($1, $2, $3, $4, $5)',
      [
        parseInt(tour_id),
        customer_name.trim(),
        parseInt(rating) || 5,
        comment.trim(),
        travel_date || new Date().toISOString().split('T')[0]
      ]
    );
    if (redirect_tour) {
      res.redirect(`/tours/${tour_id}?reviewed=1#reviewsSection`);
    } else {
      res.redirect('/reviews?success=1');
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
