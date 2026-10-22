const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /guides - Danh sách hướng dẫn viên du lịch
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM guides ORDER BY id ASC');
    res.render('guides/index', {
      title: 'Đội Ngũ Hướng Dẫn Viên Du Lịch | TourViet',
      guides: result.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
