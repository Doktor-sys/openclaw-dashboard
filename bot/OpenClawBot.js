const WebSocket = require('ws');
const axios = require('axios');

class OpenClawBot {
  constructor(config = {}) {
    this.name = config.name || 'OpenClaw Bot';
    this.wsUrl = config.wsUrl || 'ws://localhost:3002';
    this.apiUrl = config.apiUrl || 'http://localhost:3002';
    this.openclawPath = config.openclawPath || 'C:/openclaw';
    this.status = 'inactive';
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.currentTask = null;
  }

  connect() {
    console.log(`[${this.name}] Verbindung zu ${this.wsUrl} wird hergestellt...`);
    console.log(`[${this.name}] OpenClaw Pfad: ${this.openclawPath}`);
    
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log(`[${this.name}] WebSocket verbunden`);
      this.status = 'active';
      this.reconnectAttempts = 0;
      this.register();
      this.sendStatus();
    });

    this.ws.on('message', (data) => {
      try {
        if (!data) {
          console.warn(`[${this.name}] Leere Nachricht empfangen`);
          return;
        }
        // Buffer zu String konvertieren
        const dataString = Buffer.isBuffer(data) ? data.toString() : data;
        const message = JSON.parse(dataString);
        console.log(`[${this.name}] ✅ Nachricht empfangen:`, message.type);
        this.handleMessage(message);
      } catch (error) {
        console.error(`[${this.name}] ❌ Fehler beim Parsen:`, error.message);
        console.error(`[${this.name}] 📄 Rohe Daten:`, data);
      }
    });

    this.ws.on('close', () => {
      console.log(`[${this.name}] Verbindung geschlossen`);
      this.status = 'inactive';
      this.attemptReconnect();
    });

    this.ws.on('error', (error) => {
      console.error(`[${this.name}] WebSocket Fehler:`, error.message);
      this.status = 'error';
      this.sendStatus();
    });
  }

  register() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log(`[${this.name}] Registriere beim Backend...`);
      this.ws.send(JSON.stringify({
        type: 'bot_register',
        bot: this.name,
        capabilities: ['code_generation', 'task_processing'],
        openclawPath: this.openclawPath
      }));
    }
  }

  handleMessage(message) {
    console.log(`[${this.name}] Nachricht:`, message.type, message);

    switch (message.type) {
      case 'task_assign':
        this.handleTaskAssignment(message.task);
        break;
      case 'task_update':
        // Reagiere auf Status-Änderungen zu "in_progress"
        if (message.taskId && message.status === 'in_progress') {
          console.log(`[${this.name}] Aufgabe ist jetzt in Arbeit:`, message.taskId);
          this.checkAndProcessTask(message.taskId);
        }
        break;
      case 'context_update':
        this.handleContextUpdate(message.context);
        break;
      case 'bot_command':
        this.handleBotCommand(message.command);
        break;
      case 'status_request':
        this.sendStatus();
        break;
      default:
        console.log(`[${this.name}] Unbekannter Typ:`, message.type);
    }
  }

  async checkAndProcessTask(taskId) {
    try {
      // Hole Aufgabendetails über API
      const response = await axios.get(`${this.apiUrl}/api/tasks/${taskId}`);
      const task = response.data;
      
      console.log(`[${this.name}] Prüfe Aufgabe:`, task.title);
      
      // Bearbeite Aufgaben mit bestimmten Keywords
      if (task.title.toLowerCase().includes('wetter') || 
          task.title.toLowerCase().includes('app') ||
          task.title.toLowerCase().includes('erstellen')) {
        console.log(`[${this.name}] Starte Verarbeitung...`);
        await this.handleTaskAssignment(task);
      }
    } catch (error) {
      console.error(`[${this.name}] Fehler beim Prüfen der Aufgabe:`, error.message);
    }
  }

  sendStatus() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'bot_status_update',
        bot: this.name,
        status: this.status,
        currentTask: this.currentTask,
        timestamp: new Date().toISOString()
      }));
    }
  }

  async handleTaskAssignment(task) {
    console.log(`[${this.name}] Aufgabe zugewiesen:`, task.title);
    this.currentTask = task;
    this.status = 'working';
    this.sendStatus();

    try {
      await this.processTask(task);
      this.status = 'active';
      this.currentTask = null;
      this.sendStatus();
      this.acknowledgeTask(task.id, 'completed');
    } catch (error) {
      console.error(`[${this.name}] Fehler:`, error);
      this.status = 'error';
      this.sendStatus();
      this.acknowledgeTask(task.id, 'failed', error.message);
    }
  }

  async processTask(task) {
    console.log(`[${this.name}] Verarbeite: ${task.title}`);
    
    // Simulierte AI-Verarbeitung
    const steps = [
      'Analysiere Anforderungen...',
      'Entwerfe Lösungsansatz...', 
      'Generiere Code in C:\\openclaw...',
      'Teste Implementation...',
      'Speichere Dateien...',
      'Aufgabe abgeschlossen!'
    ];
    
    for (const step of steps) {
      console.log(`[${this.name}] ${step}`);
      
      // Fortschritt an Dashboard
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'bot_progress',
          taskId: task.id,
          message: step,
          timestamp: new Date().toISOString()
        }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Wetter-App generieren wenn im Titel
    if (task.title.toLowerCase().includes('wetter')) {
      await this.generateWeatherApp();
    }

    return { result: 'completed' };
  }

  async generateWeatherApp() {
    console.log(`[${this.name}] Generiere Wetter-App...`);
    
    try {
      const fs = require('fs');
      const path = require('path');
      
      const weatherAppCode = `import React, { useState, useEffect } from 'react';

const WeatherApp = () => {
  const [cities] = useState([
    { name: 'London', temp: 15, condition: 'Rainy', country: 'UK' },
    { name: 'Paris', temp: 18, condition: 'Cloudy', country: 'FR' },
    { name: 'Brussels', temp: 16, condition: 'Sunny', country: 'BE' }
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🌤️ Weather Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cities.map(city => (
          <div key={city.name} className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-xl">{city.name}</h3>
            <p className="text-sm opacity-80">{city.country}</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">{city.temp}°C</span>
              <p className="mt-2">{city.condition}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center mt-6 text-gray-500 text-sm">
        Generated by OpenClaw AI Bot
      </p>
    </div>
  );
};

export default WeatherApp;`;

      const outputDir = path.join(this.openclawPath, 'generated');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputFile = path.join(outputDir, 'WeatherApp.jsx');
      fs.writeFileSync(outputFile, weatherAppCode);
      
      console.log(`[${this.name}] ✅ Erstellt: ${outputFile}`);
      
      // Erfolg an Dashboard melden
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'bot_file_created',
          file: 'WeatherApp.jsx',
          path: outputFile,
          timestamp: new Date().toISOString()
        }));
      }
      
    } catch (error) {
      console.error(`[${this.name}] ❌ Fehler:`, error.message);
    }
  }

  acknowledgeTask(taskId, status, error = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'task_update',
        taskId,
        status,
        error,
        bot: this.name,
        timestamp: new Date().toISOString()
      }));
    }
  }

  handleContextUpdate(context) {
    console.log(`[${this.name}] Kontext:`, context.filename);
    this.status = 'processing';
    this.sendStatus();

    setTimeout(() => {
      this.status = 'active';
      this.sendStatus();
    }, 1000);
  }

  handleBotCommand(command) {
    console.log(`[${this.name}] Befehl:`, command.action);

    switch (command.action) {
      case 'restart':
        this.ws.close();
        setTimeout(() => this.connect(), 2000);
        break;
      case 'pause':
        this.status = 'paused';
        this.sendStatus();
        break;
      case 'resume':
        this.status = 'active';
        this.sendStatus();
        break;
      default:
        console.log(`[${this.name}] Unbekannt:`, command.action);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[${this.name}] Versuch ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error(`[${this.name}] Maximale Versuche erreicht.`);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    console.log(`[${this.name}] Getrennt`);
  }
}

module.exports = OpenClawBot;