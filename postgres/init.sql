-- ═══════════════════════════════════════════════════
-- TourViet Database Schema + Seed Data
-- PostgreSQL 15+
-- ═══════════════════════════════════════════════════

-- Create application user with limited permissions (hardening)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tourapp') THEN
    CREATE ROLE tourapp WITH LOGIN PASSWORD 'TourApp@Secure2024!';
  END IF;
END
$$;

-- Grant connect permission
GRANT CONNECT ON DATABASE booking_tour TO tourapp;
GRANT USAGE ON SCHEMA public TO tourapp;

-- ── Tables ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tours (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  duration    INTEGER NOT NULL CHECK (duration > 0),
  price       NUMERIC(12,2) NOT NULL CHECK (price > 0),
  max_slots   INTEGER NOT NULL DEFAULT 20 CHECK (max_slots > 0),
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id               SERIAL PRIMARY KEY,
  tour_id          INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  departure_date   DATE NOT NULL,
  available_slots  INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT schedules_slots_check CHECK (available_slots >= 0)
);

CREATE TABLE IF NOT EXISTS customers (
  id         SERIAL PRIMARY KEY,
  full_name  VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  phone      VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id          SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  schedule_id INTEGER NOT NULL REFERENCES schedules(id),
  num_people  INTEGER NOT NULL CHECK (num_people > 0),
  total_price NUMERIC(14,2) NOT NULL,
  notes       TEXT DEFAULT '',
  status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
CREATE INDEX IF NOT EXISTS idx_schedules_tour_id ON schedules(tour_id);
CREATE INDEX IF NOT EXISTS idx_schedules_departure ON schedules(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Grant table permissions to app user (least privilege - hardening)
GRANT SELECT, INSERT, UPDATE ON tours, schedules, customers, bookings TO tourapp;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tourapp;

-- ── Seed Data ───────────────────────────────────────

INSERT INTO tours (name, destination, duration, price, max_slots, description, image_url) VALUES
  ('Hà Nội - Hạ Long Bay Explorer', 'Quảng Ninh, Hà Nội', 3, 2500000,
   25, 'Khám phá vịnh Hạ Long huyền thoại - Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Tour bao gồm cruise 2 ngày 1 đêm trên vịnh.',
   'https://images.unsplash.com/photo-1573951717494-a99cdb5c0fd2?w=600'),

  ('Đà Nẵng - Hội An - Sơn Trà', 'Đà Nẵng, Quảng Nam', 4, 3800000,
   20, 'Hành trình khám phá thành phố biển Đà Nẵng, phố cổ Hội An và bán đảo Sơn Trà xanh mướt.',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600'),

  ('Phú Quốc Thiên Đường Biển', 'Kiên Giang', 5, 5500000,
   15, 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển cát trắng, nước trong xanh, và các hoạt động lặn ngắm san hô.',
   'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600'),

  ('Sapa - Ruộng Bậc Thang Mùa Vàng', 'Lào Cai', 3, 2200000,
   18, 'Trekking qua những ruộng bậc thang ngoạn mục ở Sapa, thăm các bản làng dân tộc và chinh phục đỉnh Fansipan.',
   'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600'),

  ('Hội An Ancient Town & Cooking Class', 'Quảng Nam', 2, 1500000,
   30, 'Dạo bộ trong phố cổ Hội An về đêm với đèn lồng lung linh, học nấu ẩm thực truyền thống Hội An.',
   'https://images.unsplash.com/photo-1598899537310-b2456a72cd3b?w=600'),

  ('Mũi Né - Đồi Cát Bay Bình Thuận', 'Bình Thuận', 3, 1800000,
   25, 'Khám phá vùng đất Mũi Né với đồi cát đỏ hùng vĩ, bãi biển hoang sơ và làng chài truyền thống.',
   'https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?w=600')
ON CONFLICT DO NOTHING;

-- Insert schedules for each tour
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '7 days', max_slots FROM tours WHERE id = 1;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '14 days', max_slots FROM tours WHERE id = 1;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '10 days', max_slots FROM tours WHERE id = 2;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '21 days', max_slots FROM tours WHERE id = 2;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '5 days', max_slots FROM tours WHERE id = 3;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '12 days', max_slots FROM tours WHERE id = 4;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '8 days', max_slots FROM tours WHERE id = 5;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '15 days', max_slots FROM tours WHERE id = 6;

-- Sample customer and booking
INSERT INTO customers (full_name, email, phone) VALUES
  ('Nguyễn Văn Minh', 'minh.nguyen@email.com', '0912345678'),
  ('Trần Thị Lan', 'lan.tran@email.com', '0987654321')
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_id, schedule_id, num_people, total_price, status)
SELECT c.id, s.id, 2, t.price * 2, 'confirmed'
FROM customers c, schedules s, tours t
WHERE c.email = 'minh.nguyen@email.com' AND s.tour_id = t.id AND t.id = 1
LIMIT 1
ON CONFLICT DO NOTHING;
