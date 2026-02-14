const OpenClawBot = require('./OpenClawBot');
const healthServer = require('./health-server');

console.log('[Bot Service] Starting OpenClaw AI Bot Service...');
console.log('[Bot Service] Connecting to C:\\openclaw integration...');

// Bot konfigurieren für C:\openclaw Verbindung
const bot = new OpenClawBot({
  name: 'OpenClaw AI Bot',
  wsUrl: process.env.BOT_WS_URL || 'ws://backend:3002',
  apiUrl: process.env.BOT_API_URL || 'http://backend:3002',
  // C:\openclaw Referenz
  openclawPath: process.env.OPENCLAW_PATH || 'C:/openclaw'
});

// Erweiterte AI-Funktionen
bot.processTask = async function(task) {
  console.log(`[${this.name}] AI-Verarbeitung der Aufgabe: ${task.title}`);
  
  // Simulierte AI-Verarbeitung
  const steps = [
    'Analysiere Anforderungen...',
    'Entwerfe Lösungsansatz...',
    'Generiere Code...',
    'Teste Implementation...',
    'Aufgabe abgeschlossen!'
  ];
  
  for (const step of steps) {
    console.log(`[${this.name}] ${step}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Status-Update an Dashboard senden
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'bot_progress',
        taskId: task.id,
        message: step,
        timestamp: new Date().toISOString()
      }));
    }
  }
  
  // Wetter-App als Beispiel generieren
  if (task.title.toLowerCase().includes('wetter')) {
    console.log(`[${this.name}] Generiere Wetter-App Komponenten...`);
    await this.generateWeatherApp();
  }
  
  return { 
    result: 'Task completed successfully',
    filesGenerated: ['WeatherApp.jsx'],
    path: 'C:/openclaw/generated'
  };
};

bot.generateWeatherApp = async function() {
  console.log(`[${this.name}] Erstelle Wetter-App in C:\\openclaw...`);
  
  // Simuliere Dateierstellung
  const fs = require('fs');
  const path = require('path');
  
  const weatherAppCode = `
import React, { useState, useEffect } from 'react';

const WeatherApp = () => {
  const [cities, setCities] = useState([
    { name: 'London', temp: 15, condition: 'Rainy' },
    { name: 'Paris', temp: 18, condition: 'Cloudy' },
    { name: 'Brussels', temp: 16, condition: 'Sunny' }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weather Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {cities.map(city => (
          <div key={city.name} className="bg-blue-100 p-4 rounded">
            <h3 className="font-bold">{city.name}</h3>
            <p>{city.temp}°C - {city.condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherApp;
`;

  try {
    const outputDir = path.join(this.openclawPath, 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'WeatherApp.jsx'), 
      weatherAppCode
    );
    
    console.log(`[${this.name}] ✅ Wetter-App erstellt in: ${outputDir}`);
  } catch (error) {
    console.error(`[${this.name}] ❌ Fehler beim Erstellen:`, error.message);
  }
};

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('[Bot Service] Shutting down...');
  bot.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Bot Service] Shutting down...');
  bot.disconnect();
  process.exit(0);
});

// Bot starten mit Verzögerung
setTimeout(() => {
  console.log('[Bot Service] Connecting to Dashboard WebSocket...');
  bot.connect();
}, 2000);