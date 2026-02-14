@echo off
echo === OpenClaw Dashboard Production Deployment ===

REM 1. Stoppen und löschen
echo Stoppen existierender Container...
docker-compose -f docker-compose.server.yml down -v

REM 2. Images neu bauen
echo Bauen der Images...
docker-compose -f docker-compose.server.yml build --no-cache

REM 3. Container starten
echo Starten der Container...
docker-compose -f docker-compose.server.yml up -d

REM 4. Warten für Start
echo Warten auf Start...
timeout /t 30 /nobreak

REM 5. Status prüfen
echo === Container Status ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo === Health Check ===
curl -s http://localhost:3002/health || echo Backend nicht erreichbar
curl -s http://localhost:3000 | find "title" || echo Frontend nicht erreichbar

echo.
echo === Bot Status ===
curl -s http://localhost:3002/api/bot/status

echo.
echo === Deployment abgeschlossen ===
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3002
echo Bot-Status: http://localhost:3002/api/bot/status