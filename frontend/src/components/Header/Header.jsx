import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import { wsService } from '../../services/websocket';

export default function Header() {
  const [user, setUser] = useState(null);
  const [botStatus, setBotStatus] = useState('offline');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    wsService.connect();
    
    const unsubscribeStatus = wsService.subscribe('bot_status', (status) => {
      setBotStatus(status.status || 'offline');
    });

    const unsubscribeOnline = wsService.subscribe('bot_online', () => {
      setBotStatus('online');
    });

    const unsubscribeOffline = wsService.subscribe('bot_offline', () => {
      setBotStatus('offline');
    });

    const unsubscribeIdle = wsService.subscribe('bot_idle', () => {
      setBotStatus('idle');
    });

    return () => {
      unsubscribeStatus();
      unsubscribeOnline();
      unsubscribeOffline();
      unsubscribeIdle();
      wsService.disconnect();
    };
  }, []);

  const loadUser = () => {
    const userData = AuthService.getUser();
    setUser(userData);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  const getBotStatusColor = () => {
    switch (botStatus) {
      case 'online': return 'bg-green-500';
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  const getBotStatusText = () => {
    switch (botStatus) {
      case 'online': return 'Online';
      case 'running': return 'Läuft';
      case 'idle': return 'Leerlauf';
      default: return 'Offline';
    }
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-blue-600">OpenClaw</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
          <div className={`w-2.5 h-2.5 rounded-full ${getBotStatusColor()}`}></div>
          <span className="text-sm text-gray-700">Bot: {getBotStatusText()}</span>
        </div>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>{user.username}</span>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Einstellungen
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
