const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET /bookings - Danh sách booking
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, c.full_name, c.email, c.phone,
             t.name as tour_name, t.destination,
             s.departure_date, s.id as schedule_id
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN tours t ON s.tour_id = t.id
      ORDER BY b.created_at DESC
    `);
    res.render('bookings/index', {
      title: 'Quản Lý Đặt Tour - TourViet',
      bookings: result.rows,
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

// GET /bookings/new - Form đặt tour
router.get('/new', async (req, res) => {
  try {
    const { schedule_id } = req.query;
    let schedule = null;
    let tour = null;
    if (schedule_id) {
      const result = await db.query(
        `SELECT s.*, t.name as tour_name, t.price, t.destination, t.duration, t.image_url
         FROM schedules s JOIN tours t ON s.tour_id = t.id WHERE s.id = $1`,
        [schedule_id]
      );
      if (result.rows.length > 0) {
        schedule = result.rows[0];
        tour = result.rows[0];
      }
    }

    const allSchedulesResult = await db.query(`
      SELECT s.id as schedule_id, s.departure_date, s.available_slots,
             t.id as tour_id, t.name as tour_name, t.price, t.destination, t.duration, t.image_url
      FROM schedules s
      JOIN tours t ON s.tour_id = t.id
      ORDER BY t.name ASC, s.departure_date ASC
    `);

    res.render('bookings/new', {
      title: 'Đặt Tour - TourViet',
      schedule,
      tour,
      allSchedules: allSchedulesResult.rows || [],
    });
  } catch (err) {
    console.error('Error rendering booking form:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

// POST /bookings - Tạo booking mới
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const { full_name, email, phone, schedule_id, num_people, notes, payment_method } = req.body;

    // Tạo hoặc tìm customer
    let customerResult = await client.query(
      'SELECT id FROM customers WHERE email = $1',
      [email]
    );
    let customerId;
    if (customerResult.rows.length === 0) {
      const newCustomer = await client.query(
        'INSERT INTO customers (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [full_name, email, phone]
      );
      customerId = newCustomer.rows[0].id;
    } else {
      customerId = customerResult.rows[0].id;
    }

    // Lấy thông tin schedule và giá tour
    const scheduleResult = await client.query(
      `SELECT s.*, t.price FROM schedules s JOIN tours t ON s.tour_id = t.id WHERE s.id = $1`,
      [schedule_id]
    );
    if (scheduleResult.rows.length === 0) throw new Error('Lịch khởi hành không tồn tại');
    const schedule = scheduleResult.rows[0];
    if (schedule.available_slots < parseInt(num_people)) {
      throw new Error('Không đủ chỗ trống cho lịch khởi hành này');
    }

    const totalPrice = parseFloat(schedule.price) * parseInt(num_people);

    // Ghi nhận hình thức thanh toán vào ghi chú booking
    const payMap = {
      cash: 'Tiền mặt',
      transfer: 'Chuyển khoản',
      card: 'Quẹt thẻ'
    };
    const paymentLabel = payMap[payment_method] || (payment_method ? payment_method : 'Tiền mặt');
    const finalNotes = notes && notes.trim()
      ? `${notes.trim()} (Hình thức thanh toán: ${paymentLabel})`
      : `Hình thức thanh toán: ${paymentLabel}`;

    // Tạo booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, schedule_id, num_people, total_price, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING id`,
      [customerId, schedule_id, num_people, totalPrice, finalNotes]
    );

    // Trừ số chỗ
    await client.query(
      'UPDATE schedules SET available_slots = available_slots - $1 WHERE id = $2',
      [num_people, schedule_id]
    );

    await client.query('COMMIT');
    console.log(`New booking created: ID=${bookingResult.rows[0].id}, Customer=${full_name}, Amount=${totalPrice}`);
    res.redirect(`/bookings/${bookingResult.rows[0].id}?success=1`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', err);
    res.status(400).render('bookings/new', {
      title: 'Đặt Tour - TourViet',
      error: err.message,
      schedule: null,
      tour: null,
    });
  } finally {
    client.release();
  }
});

// GET /bookings/:id - Chi tiết booking
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT b.*, c.full_name, c.email, c.phone,
             t.name as tour_name, t.destination, t.duration, t.image_url,
             s.departure_date
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN schedules s ON b.schedule_id = s.id
      JOIN tours t ON s.tour_id = t.id
      WHERE b.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).render('404', { title: 'Không tìm thấy đặt chỗ' });
    }
    res.render('bookings/detail', {
      title: `Đặt Chỗ #${req.params.id} - TourViet`,
      booking: result.rows[0],
      success: req.query.success === '1',
    });
  } catch (err) {
    console.error('Error fetching booking detail:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

// PUT /bookings/:id/status - Cập nhật trạng thái
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    }
    await db.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.redirect('/bookings');
  } catch (err) {
    console.error('Error updating booking status:', err);
    res.status(500).render('error', { title: 'Lỗi', message: err.message });
  }
});

module.exports = router;
