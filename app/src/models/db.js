const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'booking_tour',
  user: process.env.DB_USER || 'tourapp',
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

pool.on('error', (err) => {
  // Silent on idle client error during fallback
});

// ── In-Memory Fallback Database ──────────────────────────────────────────
let usePg = null; // null: unknown, true: PG active, false: fallback active

const seedTours = [
  {
    id: 1,
    name: 'Hà Nội - Khám Phá Vịnh Hạ Long',
    destination: 'Quảng Ninh, Hà Nội',
    duration: 3,
    price: 2500000,
    max_slots: 25,
    description: 'Khám phá vịnh Hạ Long huyền thoại - Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Tour bao gồm du thuyền 2 ngày 1 đêm trên vịnh.',
    image_url: '/images/tours/tour-1.jpg',
    created_at: new Date('2026-01-01'),
  },
  {
    id: 2,
    name: 'Đà Nẵng - Hội An - Sơn Trà',
    destination: 'Đà Nẵng, Quảng Nam',
    duration: 4,
    price: 3800000,
    max_slots: 20,
    description: 'Hành trình khám phá thành phố biển Đà Nẵng, phố cổ Hội An và bán đảo Sơn Trà xanh mướt.',
    image_url: '/images/tours/tour-2.jpg',
    created_at: new Date('2026-01-02'),
  },
  {
    id: 3,
    name: 'Phú Quốc Thiên Đường Biển',
    destination: 'Kiên Giang',
    duration: 5,
    price: 5500000,
    max_slots: 15,
    description: 'Nghỉ dưỡng tại đảo ngọc Phú Quốc với bãi biển cát trắng, nước trong xanh, và các hoạt động lặn ngắm san hô.',
    image_url: '/images/tours/tour-3.jpg',
    created_at: new Date('2026-01-03'),
  },
  {
    id: 4,
    name: 'Sapa - Ruộng Bậc Thang Mùa Vàng',
    destination: 'Lào Cai',
    duration: 3,
    price: 2200000,
    max_slots: 18,
    description: 'Chiêm ngưỡng những thửa ruộng bậc thang kỳ vĩ tại thung lũng Mường Hoa, thăm bản Cát Cát và chinh phục đỉnh Fansipan.',
    image_url: '/images/tours/tour-4.jpg',
    created_at: new Date('2026-01-04'),
  },
  {
    id: 5,
    name: 'Phố Cổ Hội An & Trải Nghiệm Ẩm Thực',
    destination: 'Quảng Nam',
    duration: 2,
    price: 1500000,
    max_slots: 30,
    description: 'Dạo bước ngắm những ngôi nhà cổ sơn vàng rực rỡ, phố lồng đèn lung linh ven sông Hoài và trải nghiệm lớp học nấu ăn truyền thống.',
    image_url: '/images/tours/tour-5.jpg',
    created_at: new Date('2026-01-05'),
  },
  {
    id: 6,
    name: 'Mũi Né - Đồi Cát Bay Bình Thuận',
    destination: 'Bình Thuận',
    duration: 3,
    price: 1800000,
    max_slots: 25,
    description: 'Khám phá vùng đất Mũi Né với đồi cát đỏ hùng vĩ, bãi biển hoang sơ và làng chài truyền thống.',
    image_url: '/images/tours/tour-6.jpg',
    created_at: new Date('2026-01-06'),
  },
  {
    id: 7,
    name: 'Nha Trang - Vịnh Biển Xanh & VinWonders',
    destination: 'Khánh Hòa',
    duration: 4,
    price: 3200000,
    max_slots: 25,
    description: 'Khám phá vịnh Nha Trang xinh đẹp, lặn ngắm san hô tại Hòn Mun, thư giãn tắm khoáng nóng và vui chơi thả ga tại VinWonders.',
    image_url: '/images/tours/tour-7.jpg',
    created_at: new Date('2026-01-07'),
  },
  {
    id: 8,
    name: 'Đà Lạt - Thành Phố Ngàn Hoa & Đồi Chè Cầu Đất',
    destination: 'Lâm Đồng',
    duration: 3,
    price: 2100000,
    max_slots: 20,
    description: 'Tận hưởng không khí se lạnh cao nguyên, tham quan đồi chè Cầu Đất, vườn hoa cẩm tú cầu, thác Datanla và hồ Tuyền Lâm thơ mộng.',
    image_url: '/images/tours/tour-8.jpg',
    created_at: new Date('2026-01-08'),
  },
  {
    id: 9,
    name: 'Cố Đô Huế - Di Sản Triều Nguyễn & Sông Hương',
    destination: 'Thừa Thiên Huế',
    duration: 2,
    price: 1600000,
    max_slots: 30,
    description: 'Tham quan Đại Nội Huế, lăng Khải Định, chùa Thiên Mụ và trải nghiệm nghe ca Huế du dương trên thuyền rồng sông Hương.',
    image_url: '/images/tours/tour-9.jpg',
    created_at: new Date('2026-01-09'),
  },
  {
    id: 10,
    name: 'Ninh Bình - Tràng An & Tuyệt Tình Cốc',
    destination: 'Ninh Bình',
    duration: 2,
    price: 1400000,
    max_slots: 25,
    description: 'Xuôi thuyền theo dòng Sào Khê ngắm quần thể danh thắng Tràng An di sản thế giới, chinh phục đỉnh Hang Múa ngắm toàn cảnh Tam Cốc.',
    image_url: '/images/tours/tour-10.jpg',
    created_at: new Date('2026-01-10'),
  },
  {
    id: 11,
    name: 'Hà Giang - Cao Nguyên Đá & Đèo Mã Pí Lèng',
    destination: 'Hà Giang',
    duration: 4,
    price: 3500000,
    max_slots: 16,
    description: 'Hành trình qua cổng trời Quản Bạ, ngắm cánh đồng hoa tam giác mạch, chinh phục đèo Mã Pí Lèng hùng vĩ và đi thuyền hẻm Tu Sản.',
    image_url: '/images/tours/tour-11.jpg',
    created_at: new Date('2026-01-11'),
  },
  {
    id: 12,
    name: 'Cần Thơ - Chợ Nổi Cái Răng & Vườn Trái Cây',
    destination: 'Cần Thơ, Tiền Giang',
    duration: 2,
    price: 1300000,
    max_slots: 28,
    description: 'Trải nghiệm nét sinh hoạt sông nước độc đáo tại chợ nổi Cái Răng, thưởng thức trái cây miệt vườn tươi ngon và đờn ca tài tử Nam Bộ.',
    image_url: '/images/tours/tour-12.jpg',
    created_at: new Date('2026-01-12'),
  },
  {
    id: 13,
    name: 'Quy Nhơn - Kỳ Co - Eo Gió Biển Xanh',
    destination: 'Bình Định',
    duration: 3,
    price: 2800000,
    max_slots: 20,
    description: 'Chiêm ngưỡng cung đường biển Kỳ Co làn nước trong vắt 2 màu, ngắm hoàng hôn rực rỡ tại Eo Gió và ghé thăm tháp Chăm Bánh Ít.',
    image_url: '/images/tours/tour-13.jpg',
    created_at: new Date('2026-01-13'),
  },
  {
    id: 14,
    name: 'Côn Đảo - Biển Xanh Huyền Bí & Di Tích Lịch Sử',
    destination: 'Bà Rịa - Vũng Tàu',
    duration: 3,
    price: 4900000,
    max_slots: 15,
    description: 'Nghỉ dưỡng tại bãi Đầm Trầu hoang sơ tuyệt đẹp, lặn ngắm rạn san hô nguyên sơ và viếng nghĩa trang Hàng Dương linh thiêng.',
    image_url: '/images/tours/tour-14.jpg',
    created_at: new Date('2026-01-14'),
  },
  {
    id: 15,
    name: 'Mộc Châu - Đồi Chè Trái Tim & Thung Lũng Mận',
    destination: 'Sơn La',
    duration: 2,
    price: 1500000,
    max_slots: 22,
    description: 'Khám phá cao nguyên Mộc Châu xanh mướt với đồi chè trái tim, vườn mận Nà Ka, thác Dải Yếm và cầu kính Bạch Long ấn tượng.',
    image_url: '/images/tours/tour-15.jpg',
    created_at: new Date('2026-01-15'),
  },
  {
    id: 16,
    name: 'Phong Nha Kẻ Bàng - Động Thiên Đường Kỳ Vĩ',
    destination: 'Quảng Bình',
    duration: 3,
    price: 2600000,
    max_slots: 20,
    description: 'Khám phá hang động thạch nhũ tráng lệ bậc nhất hoàng cung trong lòng đất tại Động Thiên Đường, chèo thuyền kayak suối Nước Moọc.',
    image_url: '/images/tours/tour-16.jpg',
    created_at: new Date('2026-01-16'),
  },
];

const nowYear = new Date().getFullYear();
const seedSchedules = [
  { id: 1, tour_id: 1, departure_date: `${nowYear}-11-05`, available_slots: 20, created_at: new Date() },
  { id: 2, tour_id: 1, departure_date: `${nowYear}-11-20`, available_slots: 25, created_at: new Date() },
  { id: 3, tour_id: 2, departure_date: `${nowYear}-11-10`, available_slots: 15, created_at: new Date() },
  { id: 4, tour_id: 2, departure_date: `${nowYear}-11-25`, available_slots: 18, created_at: new Date() },
  { id: 5, tour_id: 3, departure_date: `${nowYear}-11-12`, available_slots: 12, created_at: new Date() },
  { id: 6, tour_id: 3, departure_date: `${nowYear}-12-01`, available_slots: 15, created_at: new Date() },
  { id: 7, tour_id: 4, departure_date: `${nowYear}-11-08`, available_slots: 14, created_at: new Date() },
  { id: 8, tour_id: 4, departure_date: `${nowYear}-11-22`, available_slots: 16, created_at: new Date() },
  { id: 9, tour_id: 5, departure_date: `${nowYear}-11-07`, available_slots: 28, created_at: new Date() },
  { id: 10, tour_id: 6, departure_date: `${nowYear}-11-15`, available_slots: 22, created_at: new Date() },
  { id: 11, tour_id: 7, departure_date: `${nowYear}-11-10`, available_slots: 25, created_at: new Date() },
  { id: 12, tour_id: 8, departure_date: `${nowYear}-11-18`, available_slots: 20, created_at: new Date() },
  { id: 13, tour_id: 9, departure_date: `${nowYear}-11-12`, available_slots: 30, created_at: new Date() },
  { id: 14, tour_id: 10, departure_date: `${nowYear}-11-06`, available_slots: 25, created_at: new Date() },
  { id: 15, tour_id: 11, departure_date: `${nowYear}-11-14`, available_slots: 16, created_at: new Date() },
  { id: 16, tour_id: 12, departure_date: `${nowYear}-11-19`, available_slots: 28, created_at: new Date() },
  { id: 17, tour_id: 13, departure_date: `${nowYear}-11-15`, available_slots: 20, created_at: new Date() },
  { id: 18, tour_id: 14, departure_date: `${nowYear}-11-21`, available_slots: 15, created_at: new Date() },
  { id: 19, tour_id: 15, departure_date: `${nowYear}-11-09`, available_slots: 22, created_at: new Date() },
  { id: 20, tour_id: 16, departure_date: `${nowYear}-11-16`, available_slots: 20, created_at: new Date() },
];

const seedCustomers = [
  { id: 1, full_name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', phone: '0901234567', created_at: new Date('2026-01-10') },
  { id: 2, full_name: 'Trần Thị Bình', email: 'binh.tran@example.com', phone: '0912345678', created_at: new Date('2026-01-11') },
  { id: 3, full_name: 'Lê Hoàng Cường', email: 'cuong.le@example.com', phone: '0987654321', created_at: new Date('2026-01-12') },
];

const seedBookings = [
  { id: 1, customer_id: 1, schedule_id: 1, num_people: 2, total_price: 5000000, notes: 'Phòng hướng biển', status: 'confirmed', created_at: new Date('2026-01-15') },
  { id: 2, customer_id: 2, schedule_id: 3, num_people: 3, total_price: 11400000, notes: 'Có trẻ em 5 tuổi', status: 'confirmed', created_at: new Date('2026-01-16') },
  { id: 3, customer_id: 3, schedule_id: 5, num_people: 2, total_price: 11000000, notes: 'Thanh toán chuyển khoản', status: 'pending', created_at: new Date('2026-01-17') },
];

const seedGuides = [
  {
    id: 1,
    name: 'Nguyễn Hoàng Long',
    title: 'Trưởng Đoàn Cao Cấp',
    experience: '8 năm',
    specialty: 'Tây Bắc, Sa Pa, Hà Giang',
    languages: 'Tiếng Việt, Tiếng Anh',
    rating: 4.9,
    tours_led: 215,
    bio: 'Chuyên gia khám phá cung đường Đông - Tây Bắc, am hiểu sâu sắc phong tục văn hóa các dân tộc Mông, Dao, Tày.',
    avatar_url: '/images/guides/guide-1.svg',
    created_at: new Date('2026-01-01'),
  },
  {
    id: 2,
    name: 'Trần Thu Hà',
    title: 'Chuyên Gia Di Sản Miền Trung',
    experience: '6 năm',
    specialty: 'Huế, Hội An, Đà Nẵng',
    languages: 'Tiếng Việt, Tiếng Anh, Tiếng Pháp',
    rating: 5.0,
    tours_led: 180,
    bio: 'Cử nhân Lịch sử - Văn hóa, người truyền cảm hứng về những nét đẹp trầm mặc của Cố Đô Huế và phố cổ Hội An.',
    avatar_url: '/images/guides/guide-2.svg',
    created_at: new Date('2026-01-02'),
  },
  {
    id: 3,
    name: 'Lê Minh Tuấn',
    title: 'Hướng Dẫn Viên Khám Phá Mạo Hiểm',
    experience: '7 năm',
    specialty: 'Phong Nha - Kẻ Bàng, Hang Động',
    languages: 'Tiếng Việt, Tiếng Anh',
    rating: 4.9,
    tours_led: 160,
    bio: 'Chứng chỉ cứu hộ quốc tế WFR, giàu kinh nghiệm dẫn tour trekking rừng nhiệt đới và thám hiểm hệ thống hang động kỳ vĩ.',
    avatar_url: '/images/guides/guide-3.svg',
    created_at: new Date('2026-01-03'),
  },
  {
    id: 4,
    name: 'Phạm Mai Linh',
    title: 'Hướng Dẫn Viên Du Lịch Biển Đảo',
    experience: '5 năm',
    specialty: 'Phú Quốc, Côn Đảo, Nha Trang',
    languages: 'Tiếng Việt, Tiếng Anh, Tiếng Hàn',
    rating: 4.8,
    tours_led: 140,
    bio: 'Năng động, nhiệt huyết, đam mê lặn biển ngắm san hô và hướng dẫn du khách trải nghiệm ẩm thực hải sản bản địa.',
    avatar_url: '/images/guides/guide-4.svg',
    created_at: new Date('2026-01-04'),
  },
  {
    id: 5,
    name: 'Đặng Quốc Bảo',
    title: 'Hướng Dẫn Viên Văn Hóa Sông Nước',
    experience: '9 năm',
    specialty: 'Cần Thơ, Miệt Vườn Miền Tây',
    languages: 'Tiếng Việt, Tiếng Anh',
    rating: 4.9,
    tours_led: 260,
    bio: 'Sinh ra và lớn lên tại miền Tây sông nước, anh Bảo mang đến cho du khách câu hò điệu lý và nét chân chất Nam Bộ.',
    avatar_url: '/images/guides/guide-5.svg',
    created_at: new Date('2026-01-05'),
  },
  {
    id: 6,
    name: 'Vũ Bích Ngọc',
    title: 'Chuyên Gia Ẩm Thực & Sinh Thái',
    experience: '4 năm',
    specialty: 'Ninh Bình, Mộc Châu, Mai Châu',
    languages: 'Tiếng Việt, Tiếng Nhật',
    rating: 4.8,
    tours_led: 110,
    bio: 'Tốt nghiệp xuất sắc ngành Du lịch, luôn chu đáo tận tình và am tường các điểm check-in thiên nhiên tuyệt đẹp.',
    avatar_url: '/images/guides/guide-6.svg',
    created_at: new Date('2026-01-06'),
  },
];

const seedReviews = [
  { id: 1, tour_id: 1, customer_name: 'Nguyễn Văn Minh', rating: 5, comment: 'Chuyến đi Vịnh Hạ Long tuyệt vời! Du thuyền sang trọng, bữa ăn ngon miệng và cảnh sắc đẹp mê hồn.', travel_date: '2026-10-05', created_at: new Date('2026-10-06') },
  { id: 2, tour_id: 1, customer_name: 'Lê Thị Thu', rating: 5, comment: 'Hướng dẫn viên rất nhiệt tình, chu đáo suốt chuyến đi. Gia đình mình có trải nghiệm vô cùng đáng nhớ.', travel_date: '2026-10-01', created_at: new Date('2026-10-02') },
  { id: 3, tour_id: 2, customer_name: 'Trần Minh Quang', rating: 5, comment: 'Hành trình Đà Nẵng - Hội An trọn vẹn. Phố cổ về đêm lung linh ánh đèn hoa đăng.', travel_date: '2026-10-11', created_at: new Date('2026-10-12') },
  { id: 4, tour_id: 3, customer_name: 'Phạm Quỳnh Nga', rating: 4, comment: 'Bãi Sao và Hòn Thơm ở Phú Quốc nước trong xanh như ngọc. Dịch vụ khách sạn rất tốt.', travel_date: '2026-10-09', created_at: new Date('2026-10-10') },
  { id: 5, tour_id: 4, customer_name: 'Hoàng Văn Dũng', rating: 5, comment: 'Sa Pa mùa lúa chín vàng ươm đẹp không thể tả. Bản Cát Cát và đỉnh Fansipan đều ấn tượng.', travel_date: '2026-10-13', created_at: new Date('2026-10-14') },
  { id: 6, tour_id: 5, customer_name: 'Đỗ Mỹ Linh', rating: 5, comment: 'Phố cổ Hội An quá thơ mộng, đồ ăn Cao Lầu và mì Quảng rất chuẩn vị. Vote 5 sao!', travel_date: '2026-10-16', created_at: new Date('2026-10-17') },
  { id: 7, tour_id: 7, customer_name: 'Bùi Quốc Anh', rating: 5, comment: 'Biển Nha Trang xanh mát, lặn ngắm san hô tại Hòn Mun là trải nghiệm đỉnh nhất của mình.', travel_date: '2026-10-03', created_at: new Date('2026-10-04') },
  { id: 8, tour_id: 8, customer_name: 'Vũ Thanh Hằng', rating: 5, comment: 'Đà Lạt se lạnh dễ chịu, đồi chè Cầu Đất lúc bình minh chụp ảnh siêu đẹp.', travel_date: '2026-10-07', created_at: new Date('2026-10-08') },
  { id: 9, tour_id: 10, customer_name: 'Ngô Đức Thắng', rating: 5, comment: 'Tràng An non nước hữu tình, chèo thuyền ngắm hang động cực kỳ thư thái.', travel_date: '2026-10-14', created_at: new Date('2026-10-15') },
  { id: 10, tour_id: 11, customer_name: 'Dương Gia Bảo', rating: 5, comment: 'Đèo Mã Pí Lèng hùng vĩ ngoạn mục, dòng sông Nho Quế đẹp như tranh vẽ.', travel_date: '2026-10-12', created_at: new Date('2026-10-13') },
  { id: 11, tour_id: 12, customer_name: 'Lê Thị Mai', rating: 4, comment: 'Chợ nổi Cái Răng tấp nập ghe xuồng, trái cây miệt vườn tươi rói ngọt lịm.', travel_date: '2026-10-05', created_at: new Date('2026-10-06') },
  { id: 12, tour_id: 16, customer_name: 'Phan Hải Nam', rating: 5, comment: 'Động Thiên Đường đẹp lộng lẫy ngoài sức tưởng tượng, thạch nhũ lung linh kỳ vĩ.', travel_date: '2026-10-10', created_at: new Date('2026-10-11') },
];

const memDB = {
  tours: [...seedTours],
  schedules: [...seedSchedules],
  customers: [...seedCustomers],
  bookings: [...seedBookings],
  guides: [...seedGuides],
  reviews: [...seedReviews],
  nextCustomerId: 4,
  nextBookingId: 4,
  nextReviewId: 13,
};

function executeInMemoryQuery(sql, params = []) {
  const norm = sql.trim().replace(/\s+/g, ' ');

  // 1. Transaction controls
  if (/^(BEGIN|COMMIT|ROLLBACK)/i.test(norm)) {
    return { rows: [] };
  }

  // 2. Index stats
  if (/SELECT.*COUNT\(\*\).*total_tours/i.test(norm)) {
    return {
      rows: [{
        total_tours: memDB.tours.length,
        total_bookings: memDB.bookings.filter(b => b.status === 'confirmed').length,
        total_customers: memDB.customers.length,
      }]
    };
  }

  // 3. Tours detail: SELECT * FROM tours WHERE id = $1
  if (/SELECT \* FROM tours WHERE id = \$1/i.test(norm)) {
    const id = parseInt(params[0]);
    const found = memDB.tours.filter(t => t.id === id);
    return { rows: found };
  }

  // 4. Schedules for tour: SELECT * FROM schedules WHERE tour_id = $1...
  if (/SELECT \* FROM schedules WHERE tour_id = \$1/i.test(norm)) {
    const tourId = parseInt(params[0]);
    const found = memDB.schedules.filter(s => s.tour_id === tourId && s.available_slots > 0);
    found.sort((a, b) => new Date(a.departure_date) - new Date(b.departure_date));
    return { rows: found };
  }

  // 5. Tours list with filters
  if (/SELECT \* FROM tours/i.test(norm)) {
    let result = [...memDB.tours];
    if (params.length > 0) {
      // filters
      for (const p of params) {
        if (typeof p === 'string' && p.startsWith('%') && p.endsWith('%')) {
          const kw = p.slice(1, -1).toLowerCase();
          result = result.filter(t => t.destination.toLowerCase().includes(kw) || t.name.toLowerCase().includes(kw));
        } else if (!isNaN(p)) {
          const num = parseFloat(p);
          if (norm.includes('price >=')) {
            result = result.filter(t => t.price >= num);
          } else if (norm.includes('price <=')) {
            result = result.filter(t => t.price <= num);
          }
        }
      }
    }
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (/LIMIT 6/i.test(norm)) {
      result = result.slice(0, 6);
    }
    return { rows: result };
  }

  // 6. Schedule with tour info: SELECT s.*, t.name as tour_name... WHERE s.id = $1
  if (/FROM schedules s\s+JOIN tours t ON s\.tour_id = t\.id\s+WHERE s\.id = \$1/i.test(norm)) {
    const scheduleId = parseInt(params[0]);
    const sched = memDB.schedules.find(s => s.id === scheduleId);
    if (!sched) return { rows: [] };
    const tour = memDB.tours.find(t => t.id === sched.tour_id);
    return {
      rows: [{
        ...sched,
        tour_name: tour ? tour.name : '',
        price: tour ? tour.price : 0,
        destination: tour ? tour.destination : '',
        duration: tour ? tour.duration : 0,
        image_url: tour ? tour.image_url : '/images/tours/tour-1.jpg',
      }]
    };
  }

  // 6b. All schedules with tour info: SELECT s.id as schedule_id... FROM schedules s JOIN tours t ON s.tour_id = t.id
  if (/FROM schedules s\s+JOIN tours t ON s\.tour_id = t\.id/i.test(norm) && !/WHERE s\.id/i.test(norm)) {
    const list = memDB.schedules.map(s => {
      const tour = memDB.tours.find(t => t.id === s.tour_id);
      return {
        schedule_id: s.id,
        departure_date: s.departure_date,
        available_slots: s.available_slots,
        tour_id: tour ? tour.id : s.tour_id,
        tour_name: tour ? tour.name : '',
        price: tour ? tour.price : 0,
        destination: tour ? tour.destination : '',
        duration: tour ? tour.duration : 0,
        image_url: tour ? tour.image_url : '/images/tours/tour-1.jpg',
      };
    });
    list.sort((a, b) => a.tour_name.localeCompare(b.tour_name, 'vi'));
    return { rows: list };
  }

  // 7. Find customer by email: SELECT id FROM customers WHERE email = $1
  if (/SELECT id FROM customers WHERE email = \$1/i.test(norm)) {
    const email = params[0];
    const found = memDB.customers.filter(c => c.email.toLowerCase() === email.toLowerCase());
    return { rows: found };
  }

  // 8. Insert customer: INSERT INTO customers (full_name, email, phone) VALUES ($1, $2, $3) RETURNING id
  if (/INSERT INTO customers/i.test(norm)) {
    const [full_name, email, phone] = params;
    const newCust = {
      id: memDB.nextCustomerId++,
      full_name,
      email,
      phone,
      created_at: new Date(),
    };
    memDB.customers.push(newCust);
    return { rows: [{ id: newCust.id }] };
  }

  // 9. Insert booking: INSERT INTO bookings ... RETURNING id
  if (/INSERT INTO bookings/i.test(norm)) {
    const [customer_id, schedule_id, num_people, total_price, notes] = params;
    const newBooking = {
      id: memDB.nextBookingId++,
      customer_id: parseInt(customer_id),
      schedule_id: parseInt(schedule_id),
      num_people: parseInt(num_people),
      total_price: parseFloat(total_price),
      notes: notes || '',
      status: 'pending',
      created_at: new Date(),
    };
    memDB.bookings.push(newBooking);
    return { rows: [{ id: newBooking.id }] };
  }

  // 10. Update schedule slots: UPDATE schedules SET available_slots = available_slots - $1 WHERE id = $2
  if (/UPDATE schedules SET available_slots/i.test(norm)) {
    const [slots, id] = params;
    const sched = memDB.schedules.find(s => s.id === parseInt(id));
    if (sched) {
      sched.available_slots = Math.max(0, sched.available_slots - parseInt(slots));
    }
    return { rows: [] };
  }

  // 11. Booking detail: WHERE b.id = $1
  if (/FROM bookings b.*WHERE b.id = \$1/i.test(norm)) {
    const id = parseInt(params[0]);
    const b = memDB.bookings.find(bk => bk.id === id);
    if (!b) return { rows: [] };
    const c = memDB.customers.find(cust => cust.id === b.customer_id) || {};
    const s = memDB.schedules.find(sc => sc.id === b.schedule_id) || {};
    const t = memDB.tours.find(tr => tr.id === s.tour_id) || {};
    return {
      rows: [{
        ...b,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        tour_name: t.name,
        destination: t.destination,
        duration: t.duration,
        image_url: t.image_url,
        departure_date: s.departure_date,
      }]
    };
  }

  // 12. Bookings list: SELECT b.*, c.full_name, c.email, c.phone...
  if (/FROM bookings b/i.test(norm)) {
    const rows = memDB.bookings.map(b => {
      const c = memDB.customers.find(cust => cust.id === b.customer_id) || {};
      const s = memDB.schedules.find(sc => sc.id === b.schedule_id) || {};
      const t = memDB.tours.find(tr => tr.id === s.tour_id) || {};
      return {
        ...b,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        tour_name: t.name,
        destination: t.destination,
        departure_date: s.departure_date,
        schedule_id: s.id,
      };
    });
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows };
  }

  // 13. Update booking status
  if (/UPDATE bookings SET status = \$1 WHERE id = \$2/i.test(norm)) {
    const [status, id] = params;
    const b = memDB.bookings.find(bk => bk.id === parseInt(id));
    if (b) b.status = status;
    return { rows: [] };
  }

  // 14. Customers list
  if (/FROM customers c/i.test(norm)) {
    const rows = memDB.customers.map(c => {
      const userBookings = memDB.bookings.filter(b => b.customer_id === c.id);
      const totalSpent = userBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      return {
        ...c,
        booking_count: userBookings.length,
        total_spent: totalSpent,
      };
    });
    rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows };
  }

  // 15. Guides list: SELECT * FROM guides
  if (/FROM guides/i.test(norm)) {
    const list = [...memDB.guides];
    list.sort((a, b) => a.id - b.id);
    return { rows: list };
  }

  // 16. Reviews for a tour: SELECT * FROM reviews WHERE tour_id = $1
  if (/FROM reviews.*WHERE.*tour_id\s*=\s*\$1/i.test(norm)) {
    const tourId = parseInt(params[0]);
    const list = memDB.reviews.filter(r => r.tour_id === tourId);
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  // 17. All reviews with tour name
  if (/FROM reviews/i.test(norm)) {
    const list = memDB.reviews.map(r => {
      const t = memDB.tours.find(tour => tour.id === r.tour_id) || {};
      return {
        ...r,
        tour_name: t.name || 'Tour Du Lịch',
        destination: t.destination || '',
      };
    });
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: list };
  }

  // 18. Insert review: INSERT INTO reviews ...
  if (/INSERT INTO reviews/i.test(norm)) {
    const [tour_id, customer_name, rating, comment, travel_date] = params;
    const newRev = {
      id: memDB.nextReviewId++,
      tour_id: parseInt(tour_id),
      customer_name: customer_name || 'Khách du lịch',
      rating: parseInt(rating) || 5,
      comment: comment || '',
      travel_date: travel_date || new Date().toISOString().split('T')[0],
      created_at: new Date(),
    };
    memDB.reviews.unshift(newRev);
    return { rows: [{ id: newRev.id }] };
  }

  return { rows: [] };
}

// ── Smart Query Interface ───────────────────────────────────────────────
async function executeQuery(sql, params) {
  if (usePg === false) {
    return executeInMemoryQuery(sql, params);
  }

  try {
    const res = await pool.query(sql, params);
    if (usePg === null) {
      usePg = true;
      console.log('Connected to PostgreSQL Database successfully.');
    }
    return res;
  } catch (err) {
    if (usePg === null || usePg === true) {
      console.log('ℹ️ PostgreSQL not reachable, activating in-memory database fallback.');
      usePg = false;
    }
    return executeInMemoryQuery(sql, params);
  }
}

module.exports = {
  query: executeQuery,
  connect: async () => {
    if (usePg === false) {
      return {
        query: executeInMemoryQuery,
        release: () => {},
      };
    }
    try {
      const client = await pool.connect();
      return client;
    } catch (err) {
      usePg = false;
      return {
        query: executeInMemoryQuery,
        release: () => {},
      };
    }
  },
  pool,
};
