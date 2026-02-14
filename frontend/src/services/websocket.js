const WEBSOCKET_URL = 'ws://localhost:3002/ws';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('WebSocket verbunden');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data.type, data.payload);
        } catch (error) {
          console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket getrennt');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket-Fehler:', error);
      };
    } catch (error) {
      console.error('WebSocket-Verbindungsfehler:', error);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Versuche erneut zu verbinden (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => this.connect(), 3000);
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }
}

export const wsService = new WebSocketService();
