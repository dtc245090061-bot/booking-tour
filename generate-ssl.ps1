# Script PowerShell tạo SSL certificate cho Windows
$SSLDir = ".\nginx\ssl"
New-Item -ItemType Directory -Force -Path $SSLDir | Out-Null

Write-Host "🔐 Đang tạo self-signed SSL certificate..." -ForegroundColor Cyan

$cert = New-SelfSignedCertificate `
  -DnsName "tourviet.local", "localhost" `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -NotAfter (Get-Date).AddDays(365) `
  -KeyAlgorithm RSA `
  -KeyLength 2048

# Export certificate
$certPath = "$SSLDir\fullchain.pem"
$keyPath  = "$SSLDir\privkey.pem"

# Export as PEM
$certBase64 = [Convert]::ToBase64String($cert.RawData, [Base64FormattingOptions]::InsertLineBreaks)
Set-Content -Path $certPath -Value "-----BEGIN CERTIFICATE-----`n$certBase64`n-----END CERTIFICATE-----"

Write-Host "✅ Certificate tạo xong: $certPath" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  LƯU Ý: Để tạo private key đúng định dạng PEM cho Nginx trên Windows," -ForegroundColor Yellow
Write-Host "   hãy dùng WSL hoặc Git Bash và chạy generate-ssl.sh" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Lệnh cần chạy trong WSL/Git Bash:" -ForegroundColor White
Write-Host "   bash generate-ssl.sh" -ForegroundColor Cyan
