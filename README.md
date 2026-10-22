# TourViet — Hệ Thống Booking Tour Du Lịch 🌴✈

> **Đề 20 — Môn: Triển khai và Quản trị Hệ thống Phần mềm**
> **Commit 2: Tích hợp Hệ thống Giám sát Toàn diện Prometheus + Grafana**

![Stack](https://img.shields.io/badge/Stack-Node.js%20%2B%20PostgreSQL%20%2B%20Docker-blue)
![Nginx](https://img.shields.io/badge/Proxy-Nginx%20HTTPS-green)
![Monitoring](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-orange)

---

## 📋 Mô Tả Cập Nhật (Giai đoạn 2)

Bổ sung hệ thống giám sát metrics theo thời gian thực:
- **Prometheus**: Thu thập và lưu trữ metrics dạng Time Series.
- **Grafana**: Hiển thị dashboard trực quan hóa hiệu năng hệ thống.
- **cAdvisor**: Thu thập chỉ số tài nguyên CPU, RAM, Disk I/O của toàn bộ Docker container.
- **Node Exporter**: Thu thập chỉ số tài nguyên phần cứng máy chủ chủ (Host).
- **Postgres Exporter**: Thu thập chỉ số kết nối, transaction, query rate của PostgreSQL.
- **Nginx Prometheus Exporter**: Thu thập số lượng active connections, request rate của Nginx reverse proxy.
- **Node.js App Metrics**: Thư viện `prom-client` expose chỉ số HTTP request duration và total requests tại `/metrics`.

---

## 🏗️ Kiến Trúc Hệ Thống (Giai đoạn 2)

```
Client (Browser)
       │
       ▼
[Nginx Reverse Proxy] :80 / :443
       │
       ├──► [Node.js Web App] :3000   ─────────┐
       ├──► [pgAdmin 4] :80                    │ (metrics: /metrics)
       └──► [Grafana] :3000                    │
                │                              │
                ▼                              ▼
          [Prometheus] :9090 ◄─────────────────┴─────────────┐
                ▲                                            │
                ├── [cAdvisor] (Container metrics)           │
                ├── [Node Exporter] (Host metrics)           │
                ├── [Postgres Exporter] ──► [PostgreSQL]     │
                └── [Nginx Exporter] ──────► [Nginx] ────────┘
```

---

## 🚀 Hướng Dẫn Khởi Động

```bash
cp .env.example .env
.\generate-ssl.ps1
docker compose up -d --build
```

---

## 🌐 Các Dịch Vụ và Cổng Truy Cập

| Dịch vụ | URL | Thông tin đăng nhập |
|---|---|---|
| **Website TourViet** | https://localhost | — |
| **pgAdmin 4** | https://localhost/pgadmin/ | admin@tourviet.local / (xem .env) |
| **Grafana** | https://localhost/grafana/ | admin / (xem .env) |
| **Prometheus** | http://localhost:9090 | — |
| **Node.js App Metrics** | https://localhost/metrics | — |
