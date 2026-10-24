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

CREATE TABLE IF NOT EXISTS guides (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  title       VARCHAR(150) NOT NULL,
  experience  VARCHAR(50) NOT NULL,
  specialty   VARCHAR(200) NOT NULL,
  languages   VARCHAR(100) NOT NULL,
  rating      NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  tours_led   INTEGER NOT NULL DEFAULT 50,
  bio         TEXT NOT NULL,
  avatar_url  VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  tour_id       INTEGER NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  customer_name VARCHAR(150) NOT NULL,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment       TEXT NOT NULL,
  travel_date   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);
CREATE INDEX IF NOT EXISTS idx_schedules_tour_id ON schedules(tour_id);
CREATE INDEX IF NOT EXISTS idx_schedules_departure ON schedules(departure_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews(tour_id);

-- Grant table permissions to app user (least privilege - hardening)
GRANT SELECT, INSERT, UPDATE ON tours, schedules, customers, bookings, guides, reviews TO tourapp;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tourapp;

-- ── Seed Data ───────────────────────────────────────

INSERT INTO tours (name, destination, duration, price, max_slots, description, image_url) VALUES
  ('Hà Nội - Khám Phá Vịnh Hạ Long', 'Quảng Ninh, Hà Nội', 3, 2500000,
   25, 'Khám phá vịnh Hạ Long huyền thoại - Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Tour bao gồm du thuyền 2 ngày 1 đêm trên vịnh.',
   '/images/tours/tour-1.jpg'),

  ('Đà Nẵng - Hội An - Sơn Trà', 'Đà Nẵng, Quảng Nam', 4, 3800000,
   20, 'Hành trình khám phá thành phố biển Đà Nẵng, phố cổ Hội An và bán đảo Sơn Trà xanh mướt.',
   '/images/tours/tour-2.jpg'),

  ('Phú Quốc Thiên Đường Biển', 'Kiên Giang', 5, 5500000,
   15, 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển cát trắng, nước trong xanh, và các hoạt động lặn ngắm san hô.',
   '/images/tours/tour-3.jpg'),

  ('Sapa - Ruộng Bậc Thang Mùa Vàng', 'Lào Cai', 3, 2200000,
   18, 'Chiêm ngưỡng những thửa ruộng bậc thang kỳ vĩ tại thung lũng Mường Hoa, thăm bản Cát Cát và chinh phục đỉnh Fansipan.',
   '/images/tours/tour-4.jpg'),

  ('Phố Cổ Hội An & Trải Nghiệm Ẩm Thực', 'Quảng Nam', 2, 1500000,
   30, 'Dạo bước ngắm những ngôi nhà cổ sơn vàng rực rỡ, phố lồng đèn lung linh ven sông Hoài và trải nghiệm lớp học nấu ăn truyền thống.',
   '/images/tours/tour-5.jpg'),

  ('Mũi Né - Đồi Cát Bay Bình Thuận', 'Bình Thuận', 3, 1800000,
   25, 'Khám phá vùng đất Mũi Né với đồi cát đỏ hùng vĩ, bãi biển hoang sơ và làng chài truyền thống.',
   '/images/tours/tour-6.jpg'),

  ('Nha Trang - Vịnh Biển Xanh & VinWonders', 'Khánh Hòa', 4, 3200000,
   25, 'Khám phá vịnh Nha Trang xinh đẹp, lặn ngắm san hô tại Hòn Mun, thư giãn tắm khoáng nóng và vui chơi thả ga tại VinWonders.',
   '/images/tours/tour-7.jpg'),

  ('Đà Lạt - Thành Phố Ngàn Hoa & Đồi Chè Cầu Đất', 'Lâm Đồng', 3, 2100000,
   20, 'Tận hưởng không khí se lạnh cao nguyên, tham quan đồi chè Cầu Đất, vườn hoa cẩm tú cầu, thác Datanla và hồ Tuyền Lâm thơ mộng.',
   '/images/tours/tour-8.jpg'),

  ('Cố Đô Huế - Di Sản Triều Nguyễn & Sông Hương', 'Thừa Thiên Huế', 2, 1600000,
   30, 'Tham quan Đại Nội Huế, lăng Khải Định, chùa Thiên Mụ và trải nghiệm nghe ca Huế du dương trên thuyền rồng sông Hương.',
   '/images/tours/tour-9.jpg'),

  ('Ninh Bình - Tràng An & Tuyệt Tình Cốc', 'Ninh Bình', 2, 1400000,
   25, 'Xuôi thuyền theo dòng Sào Khê ngắm quần thể danh thắng Tràng An di sản thế giới, chinh phục đỉnh Hang Múa ngắm toàn cảnh Tam Cốc.',
   '/images/tours/tour-10.jpg'),

  ('Hà Giang - Cao Nguyên Đá & Đèo Mã Pí Lèng', 'Hà Giang', 4, 3500000,
   16, 'Hành trình qua cổng trời Quản Bạ, ngắm cánh đồng hoa tam giác mạch, chinh phục đèo Mã Pí Lèng hùng vĩ và đi thuyền hẻm Tu Sản.',
   '/images/tours/tour-11.jpg'),

  ('Cần Thơ - Chợ Nổi Cái Răng & Vườn Trái Cây', 'Cần Thơ, Tiền Giang', 2, 1300000,
   28, 'Trải nghiệm nét sinh hoạt sông nước độc đáo tại chợ nổi Cái Răng, thưởng thức trái cây miệt vườn tươi ngon và đờn ca tài tử Nam Bộ.',
   '/images/tours/tour-12.jpg'),

  ('Quy Nhơn - Kỳ Co - Eo Gió Biển Xanh', 'Bình Định', 3, 2800000,
   20, 'Chiêm ngưỡng cung đường biển Kỳ Co làn nước trong vắt 2 màu, ngắm hoàng hôn rực rỡ tại Eo Gió và ghé thăm tháp Chăm Bánh Ít.',
   '/images/tours/tour-13.jpg'),

  ('Côn Đảo - Biển Xanh Huyền Bí & Di Tích Lịch Sử', 'Bà Rịa - Vũng Tàu', 3, 4900000,
   15, 'Nghỉ dưỡng tại bãi Đầm Trầu hoang sơ tuyệt đẹp, lặn ngắm rạn san hô nguyên sơ và viếng nghĩa trang Hàng Dương linh thiêng.',
   '/images/tours/tour-14.jpg'),

  ('Mộc Châu - Đồi Chè Trái Tim & Thung Lũng Mận', 'Sơn La', 2, 1500000,
   22, 'Khám phá cao nguyên Mộc Châu xanh mướt với đồi chè trái tim, vườn mận Nà Ka, thác Dải Yếm và cầu kính Bạch Long ấn tượng.',
   '/images/tours/tour-15.jpg'),

  ('Phong Nha Kẻ Bàng - Động Thiên Đường Kỳ Vĩ', 'Quảng Bình', 3, 2600000,
   20, 'Khám phá hang động thạch nhũ tráng lệ bậc nhất hoàng cung trong lòng đất tại Động Thiên Đường, chèo thuyền kayak suối Nước Moọc.',
   '/images/tours/tour-16.jpg');

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
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '9 days', max_slots FROM tours WHERE id = 7;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '16 days', max_slots FROM tours WHERE id = 8;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '11 days', max_slots FROM tours WHERE id = 9;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '6 days', max_slots FROM tours WHERE id = 10;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '13 days', max_slots FROM tours WHERE id = 11;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '18 days', max_slots FROM tours WHERE id = 12;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '14 days', max_slots FROM tours WHERE id = 13;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '20 days', max_slots FROM tours WHERE id = 14;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '7 days', max_slots FROM tours WHERE id = 15;
INSERT INTO schedules (tour_id, departure_date, available_slots)
SELECT id, CURRENT_DATE + INTERVAL '12 days', max_slots FROM tours WHERE id = 16;

-- Sample customer and booking
INSERT INTO customers (full_name, email, phone) VALUES
  ('Nguyễn Văn Minh', 'minh.nguyen@email.com', '0912345678'),
  ('Trần Thị Lan', 'lan.tran@email.com', '0987654321')
ON CONFLICT DO NOTHING;

INSERT INTO bookings (customer_id, schedule_id, num_people, total_price, status)
SELECT c.id, s.id, 2, t.price * 2, 'confirmed'
FROM customers c, schedules s, tours t
WHERE c.email = 'minh.nguyen@email.com' AND s.tour_id = t.id AND t.id = 1
LIMIT 1;

-- Seed Tour Guides (Hướng dẫn viên du lịch)
INSERT INTO guides (name, title, experience, specialty, languages, rating, tours_led, bio, avatar_url) VALUES
  ('Nguyễn Hoàng Long', 'Trưởng Đoàn Cao Cấp', '8 năm', 'Tây Bắc, Sa Pa, Hà Giang', 'Tiếng Việt, Tiếng Anh', 4.9, 215,
   'Chuyên gia khám phá cung đường Đông - Tây Bắc, am hiểu sâu sắc phong tục văn hóa các dân tộc Mông, Dao, Tày.',
   '/images/guides/guide-1.svg'),
  ('Trần Thu Hà', 'Chuyên Gia Di Sản Miền Trung', '6 năm', 'Huế, Hội An, Đà Nẵng', 'Tiếng Việt, Tiếng Anh, Tiếng Pháp', 5.0, 180,
   'Cử nhân Lịch sử - Văn hóa, người truyền cảm hứng về những nét đẹp trầm mặc của Cố Đô Huế và phố cổ Hội An.',
   '/images/guides/guide-2.svg'),
  ('Lê Minh Tuấn', 'Hướng Dẫn Viên Khám Phá Mạo Hiểm', '7 năm', 'Phong Nha - Kẻ Bàng, Hang Động', 'Tiếng Việt, Tiếng Anh', 4.9, 160,
   'Chứng chỉ cứu hộ quốc tế WFR, giàu kinh nghiệm dẫn tour trekking rừng nhiệt đới và thám hiểm hệ thống hang động kỳ vĩ.',
   '/images/guides/guide-3.svg'),
  ('Phạm Mai Linh', 'Hướng Dẫn Viên Du Lịch Biển Đảo', '5 năm', 'Phú Quốc, Côn Đảo, Nha Trang', 'Tiếng Việt, Tiếng Anh, Tiếng Hàn', 4.8, 140,
   'Năng động, nhiệt huyết, đam mê lặn biển ngắm san hô và hướng dẫn du khách trải nghiệm ẩm thực hải sản bản địa.',
   '/images/guides/guide-4.svg'),
  ('Đặng Quốc Bảo', 'Hướng Dẫn Viên Văn Hóa Sông Nước', '9 năm', 'Cần Thơ, Miệt Vườn Miền Tây', 'Tiếng Việt, Tiếng Anh', 4.9, 260,
   'Sinh ra và lớn lên tại miền Tây sông nước, anh Bảo mang đến cho du khách câu hò điệu lý và nét chân chất Nam Bộ.',
   '/images/guides/guide-5.svg'),
  ('Vũ Bích Ngọc', 'Chuyên Gia Ẩm Thực & Sinh Thái', '4 năm', 'Ninh Bình, Mộc Châu, Mai Châu', 'Tiếng Việt, Tiếng Nhật', 4.8, 110,
   'Tốt nghiệp xuất sắc ngành Du lịch, luôn chu đáo tận tình và am tường các điểm check-in thiên nhiên tuyệt đẹp.',
   '/images/guides/guide-6.svg');

-- Seed Reviews (Đánh giá chuyến đi)
INSERT INTO reviews (tour_id, customer_name, rating, comment, travel_date) VALUES
  (1, 'Nguyễn Văn Minh', 5, 'Chuyến đi Vịnh Hạ Long tuyệt vời! Du thuyền sang trọng, bữa ăn ngon miệng và cảnh sắc đẹp mê hồn.', CURRENT_DATE - INTERVAL '15 days'),
  (1, 'Lê Thị Thu', 5, 'Hướng dẫn viên rất nhiệt tình, chu đáo suốt chuyến đi. Gia đình mình có trải nghiệm vô cùng đáng nhớ.', CURRENT_DATE - INTERVAL '20 days'),
  (2, 'Trần Minh Quang', 5, 'Hành trình Đà Nẵng - Hội An trọn vẹn. Phố cổ về đêm lung linh ánh đèn hoa đăng.', CURRENT_DATE - INTERVAL '10 days'),
  (3, 'Phạm Quỳnh Nga', 4, 'Bãi Sao và Hòn Thơm ở Phú Quốc nước trong xanh như ngọc. Dịch vụ khách sạn rất tốt.', CURRENT_DATE - INTERVAL '12 days'),
  (4, 'Hoàng Văn Dũng', 5, 'Sa Pa mùa lúa chín vàng ươm đẹp không thể tả. Bản Cát Cát và đỉnh Fansipan đều ấn tượng.', CURRENT_DATE - INTERVAL '8 days'),
  (5, 'Đỗ Mỹ Linh', 5, 'Phố cổ Hội An quá thơ mộng, đồ ăn Cao Lầu và mì Quảng rất chuẩn vị. Vote 5 sao!', CURRENT_DATE - INTERVAL '5 days'),
  (7, 'Bùi Quốc Anh', 5, 'Biển Nha Trang xanh mát, lặn ngắm san hô tại Hòn Mun là trải nghiệm đỉnh nhất của mình.', CURRENT_DATE - INTERVAL '18 days'),
  (8, 'Vũ Thanh Hằng', 5, 'Đà Lạt se lạnh dễ chịu, đồi chè Cầu Đất lúc bình minh chụp ảnh siêu đẹp.', CURRENT_DATE - INTERVAL '14 days'),
  (10, 'Ngô Đức Thắng', 5, 'Tràng An non nước hữu tình, chèo thuyền ngắm hang động cực kỳ thư thái.', CURRENT_DATE - INTERVAL '7 days'),
  (11, 'Dương Gia Bảo', 5, 'Đèo Mã Pí Lèng hùng vĩ ngoạn mục, dòng sông Nho Quế đẹp như tranh vẽ.', CURRENT_DATE - INTERVAL '9 days'),
  (12, 'Lê Thị Mai', 4, 'Chợ nổi Cái Răng tấp nập ghe xuồng, trái cây miệt vườn tươi rói ngọt lịm.', CURRENT_DATE - INTERVAL '16 days'),
  (16, 'Phan Hải Nam', 5, 'Động Thiên Đường đẹp lộng lẫy ngoài sức tưởng tượng, thạch nhũ lung linh kỳ vĩ.', CURRENT_DATE - INTERVAL '11 days');
