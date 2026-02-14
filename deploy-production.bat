@echo off
echo === OpenClaw Production Deployment ===

REM 1. SSL Setup
echo Erstelle SSL-Zertifikate...
mkdir nginx\ssl
cd nginx\ssl

REM Private Key erstellen
openssl genrsa -out key.pem 2048
if errorlevel 1 echo Fehler: OpenSSL nicht gefunden. Bitte installieren.
if errorlevel 1 pause && exit /b 1

REM CSR erstellen
openssl req -new -key key.pem -out csr.pem -subj "/C=DE/ST=Berlin/L=Berlin/O=OpenClaw/CN=35-195-246-45.nip.io"

REM Zertifikat erstellen
openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem

cd ..\..
echo [OK] SSL-Zertifikate erstellt

REM 2. JWT Secret setzen
set JWT_SECRET=your-super-secret-jwt-key-change-in-production-%random%

REM 3. Deployment
echo.
echo Starte Production Deployment...
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

REM 4. Warten
echo Warten auf Start...
timeout /t 45 /nobreak

REM 5. Status
echo.
echo === Production Status ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo === Health Check ===
curl -k -s https://35-195-246-45.nip.io || echo Frontend nicht erreichbar
curl -k -s https://35-195-246-45.nip.io/api/health || echo Backend nicht erreichbar

echo.
echo === Deployment abgeschlossen ===
echo.
echo Production URLs:
echo   - Frontend: https://35-195-246-45.nip.io
echo   - API:      https://35-195-246-45.nip.io/api/
echo   - Bot:      https://35-195-246-45.nip.io/api/bot/status
echo.
echo WARNUNG: Self-Signed SSL! Browser-Zertifikatswarnung ignorieren.
echo.
pause