# TourViet — Hệ Thống Booking Tour Du Lịch 🌴✈

> **Đề 20 — Môn: Triển khai và Quản trị Hệ thống Phần mềm**
> **Commit 1: Khởi tạo ứng dụng Web + PostgreSQL + pgAdmin + Nginx Reverse Proxy (HTTPS)**

![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20PostgreSQL%20%2B%20Docker-blue)
![Nginx](https://img.shields.io/badge/Proxy-Nginx%20HTTPS-green)

---

## 📋 Mô Tả Dự Án

Website đặt tour du lịch **TourViet** — hệ thống quản lý tour du lịch, lịch trình khởi hành, khách hàng và quản lý đơn đặt tour.
Hệ thống được đóng gói hoàn toàn bằng Docker Compose, sử dụng Nginx làm reverse proxy với chứng chỉ SSL tự ký và các security headers bảo mật.

---

## 🏗️ Kiến Trúc Hệ Thống (Giai đoạn 1)

```
Client (Browser)
       │
       ▼
[Nginx Reverse Proxy] :80 (HTTP redirect) / :443 (HTTPS)
       │
       ├──► [Node.js Web App] :3000   (Website Booking Tour)
       │         │
       │         ▼
       │    [PostgreSQL DB] :5432    (Lưu trữ dữ liệu)
       │
       └──► [pgAdmin 4] :80           (Quản trị cơ sở dữ liệu)
```

---

## 🚀 Hướng Dẫn Chạy Hệ Thống

### 1. Chuẩn bị biến môi trường
```bash
cp .env.example .env
```

### 2. Tạo chứng chỉ SSL tự ký
- **Linux/macOS:**
  ```bash
  chmod +x generate-ssl.sh && ./generate-ssl.sh
  ```
- **Windows (PowerShell):**
  ```powershell
  .\generate-ssl.ps1
  ```

### 3. Khởi chạy Docker Compose
```bash
docker compose up -d --build
```

---

## 🌐 Các Dịch Vụ và Cổng Truy Cập

| Dịch vụ | URL | Thông tin đăng nhập |
|---|---|---|
| **Website TourViet** | https://localhost | — |
| **pgAdmin 4** | https://localhost/pgadmin/ | admin@tourviet.local / (xem .env) |
| **Health Check** | https://localhost/health | — |

---

## 🔒 Các Biện Pháp Bảo Mật Đã Áp Dụng (Giai đoạn 1)
- SSL/TLS v1.2 & v1.3 cho toàn bộ kết nối web.
- Tự động chuyển hướng HTTP (80) sang HTTPS (443).
- Security headers: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, HSTS, CSP.
- Network isolation: Backend network được cấu hình `internal: true`.
- User phân quyền: Node.js chạy với non-root user `nodeapp`.
