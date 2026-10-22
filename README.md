# TourViet — Hệ Thống Booking Tour Du Lịch

> **Đề 20 — Môn: Triển khai và Quản trị Hệ thống Phần mềm**

- **Sinh viên thực hiện:** Nguyễn Viết Tiến
- **Mã số sinh viên (MSSV):** DTC245090061
- **Tài khoản GitHub:** [dtc245090061-bot](https://github.com/dtc245090061-bot)
- **Repository:** [https://github.com/dtc245090061-bot/booking-tour](https://github.com/dtc245090061-bot/booking-tour)

---

## 📋 Mô Tả Dự Án

Website đặt tour du lịch **TourViet** — hệ thống quản lý tour, lịch trình, khách hàng và đặt chỗ. Toàn bộ được triển khai bằng Docker Compose với monitoring và logging tập trung.

---

## 🏗️ Kiến Trúc Hệ Thống

```
Internet → Nginx (HTTPS:443)
              ├── /           → Node.js App (:3000)
              ├── /grafana/   → Grafana (:3000)
              └── /pgadmin/   → pgAdmin (:80)

Node.js App → PostgreSQL (:5432)

Prometheus ← cAdvisor / node-exporter / postgres-exporter / nginx-exporter
Grafana    ← Prometheus + Loki (datasources)
Loki       ← Promtail (log collector từ Docker containers)
```

---

## 🚀 Hướng Dẫn Chạy Hệ Thống

### Yêu cầu
- Docker Desktop (hoặc Docker Engine + Docker Compose plugin)
- OpenSSL (để tạo SSL certificate)

### Bước 1 — Clone repository
```bash
git clone https://github.com/dtc245090061-bot/booking-tour.git
cd booking-tour
```

### Bước 2 — Tạo file .env
```bash
cp .env.example .env
# Chỉnh sửa .env nếu muốn thay đổi mật khẩu
```

### Bước 3 — Tạo SSL certificate (self-signed)
**Linux/Mac:**
```bash
chmod +x generate-ssl.sh && ./generate-ssl.sh
```
**Windows (PowerShell):**
```powershell
.\generate-ssl.ps1
```

### Bước 4 — Khởi động hệ thống
```bash
docker compose up -d --build
```

### Bước 5 — Kiểm tra trạng thái
```bash
docker compose ps
docker compose logs -f app
```

---

## 🌐 Truy Cập Các Dịch Vụ

| Dịch vụ | URL | Tài khoản |
|---|---|---|
| **Website TourViet** | https://localhost | — |
| **pgAdmin** | https://localhost/pgadmin/ | admin@tourviet.local / (xem .env) |
| **Grafana** | https://localhost/grafana/ | admin / (xem .env) |
| **Prometheus** | http://localhost:9090 | — |
| **Health Check** | https://localhost/health | — |
| **Metrics** | https://localhost/metrics | — |

> ⚠️ Trình duyệt sẽ cảnh báo SSL self-signed — nhấn "Advanced > Proceed" để tiếp tục.

---

## 📊 LogQL Queries (Loki)

Truy cập Grafana → Explore → chọn datasource **Loki**:

```logql
# Query 1: Log lỗi của ứng dụng
{container="booking-tour-app"} |= "error"

# Query 2: Log Nginx với HTTP status >= 400
{job="nginx"} | pattern `<ip> - <user> [<time>] "<method> <path> <proto>" <status> <bytes>` | status > 399

# Query 3: Tất cả log theo container trong 1 giờ
{job="docker"} | container =~ ".+"

# Query 4: Thống kê log rate theo service
rate({project="booking-tour"}[5m])
```

---

## 🔒 Hardening Bảo Mật

| Biện pháp | Chi tiết |
|---|---|
| **Non-root container** | App chạy với user `nodeapp` (UID 1001); Prometheus, Grafana, Loki dùng UID không phải root |
| **Network isolation** | `backend` và `monitoring` networks đánh dấu `internal: true` — không có direct external access |
| **Mật khẩu mạnh** | Tất cả credentials qua `.env` (gitignored), mật khẩu ≥16 ký tự phức tạp |
| **Security headers** | X-Frame-Options, HSTS, X-XSS-Protection, CSP, Referrer-Policy qua Nginx |
| **Hạn chế quyền DB** | App user `tourapp` chỉ có quyền SELECT/INSERT/UPDATE trên các bảng cụ thể |
| **server_tokens off** | Nginx không tiết lộ version |
| **Rate limiting** | Nginx giới hạn 30 req/min cho app routes |
| **Resource limits** | Memory và CPU limits cho mỗi container |

---

## 🐳 Lệnh Docker Hữu Ích

```bash
# Xem logs realtime
docker compose logs -f

# Xem logs của service cụ thể
docker compose logs -f app
docker compose logs -f nginx

# Restart service
docker compose restart app

# Dừng hệ thống
docker compose down

# Dừng và xóa volumes (cẩn thận!)
docker compose down -v
```

---

## 📁 Cấu Trúc Thư Mục

```
booking-tour/
├── app/                    # Node.js application
│   ├── src/routes/         # Express routes
│   ├── src/views/          # EJS templates
│   ├── src/models/         # DB connection
│   ├── public/             # Static assets (CSS, JS)
│   └── Dockerfile
├── nginx/                  # Reverse proxy
│   ├── nginx.conf
│   └── ssl/               # SSL certs (gitignored)
├── postgres/
│   └── init.sql            # Schema + seed data
├── prometheus/
│   └── prometheus.yml
├── grafana/
│   └── provisioning/       # Auto-provision datasources & dashboards
├── loki/
│   └── loki-config.yml
├── promtail/
│   └── promtail-config.yml
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## GitHub Repository

> Repository: `https://github.com/dtc245090061-bot/booking-tour`

**Lịch sử 3 commit:**
- `feat(core): Trien khai ung dung Web Booking Tour, PostgreSQL, pgAdmin va Nginx Reverse Proxy voi HTTPS`
- `feat(monitoring): Tich hop stack giam sat Prometheus va Grafana cho container, database va web server`
- `feat(logging-hardening): Trien khai he thong log tap trung Loki + Promtail, LogQL va Hardening bao mat`
