#!/bin/bash
# ═══════════════════════════════════════════════════
# Script tạo self-signed SSL certificate cho Nginx
# Chạy một lần trước khi `docker compose up`
# ═══════════════════════════════════════════════════

SSL_DIR="./nginx/ssl"
mkdir -p "$SSL_DIR"

echo "🔐 Đang tạo self-signed SSL certificate..."

openssl req -x509 \
  -nodes \
  -days 365 \
  -newkey rsa:2048 \
  -keyout "$SSL_DIR/privkey.pem" \
  -out "$SSL_DIR/fullchain.pem" \
  -subj "/C=VN/ST=HaNoi/L=HaNoi/O=TourViet/OU=DevOps/CN=tourviet.local" \
  -addext "subjectAltName=DNS:tourviet.local,DNS:localhost,IP:127.0.0.1"

echo "✅ SSL certificate đã được tạo tại $SSL_DIR"
echo "   - fullchain.pem (certificate)"
echo "   - privkey.pem (private key)"
