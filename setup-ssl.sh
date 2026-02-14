#!/bin/bash

# SSL Zertifikate generieren (self-signed für Test)
mkdir -p nginx/ssl
cd nginx/ssl

# Private Key
openssl genrsa -out key.pem 2048

# CSR
openssl req -new -key key.pem -out csr.pem -subj "/C=DE/ST=Berlin/L=Berlin/O=OpenClaw/CN=35-195-246-45.nip.io"

# Zertifikat
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

cd ..
echo "SSL-Zertifikate generiert in nginx/ssl/"

# Umgebungsvariable setzen
export JWT_SECRET="your-super-secret-jwt-key-change-in-production-$(date +%s)"

echo ""
echo "=== SSL Test-Zertifikat erstellt ==="
echo "WARNUNG: Dies ist ein selbstsigniertes Zertifikat!"
echo "Produktion: Let's Encrypt oder CA-Zertifikat verwenden"
echo ""