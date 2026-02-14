import { useState, useEffect } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    serverUrl: 'http://localhost:3002',
    apiKey: '',
    notifications: true,
    emailNotifications: false,
    darkMode: false,
    language: 'de'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('openclaw_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setLoading(true);
    localStorage.setItem('openclaw_settings', JSON.stringify(settings));
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const handleReset = () => {
    if (confirm('Alle Einstellungen zurücksetzen?')) {
      const defaultSettings = {
        serverUrl: 'http://localhost:3002',
        apiKey: '',
        notifications: true,
        emailNotifications: false,
        darkMode: false,
        language: 'de'
      };
      setSettings(defaultSettings);
      localStorage.setItem('openclaw_settings', JSON.stringify(defaultSettings));
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ Einstellungen</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Speichert...' : '💾 Speichern'}
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✅ Einstellungen erfolgreich gespeichert!
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔗 Server-Konfiguration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backend Server URL
              </label>
              <input
                type="text"
                name="serverUrl"
                value={settings.serverUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="http://localhost:3002"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key (optional)
              </label>
              <input
                type="password"
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••••••••••"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔔 Benachrichtigungen</h2>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Browser-Benachrichtigungen aktivieren</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">E-Mail-Benachrichtigungen</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🎨 Darstellung</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sprache
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="de">Deutsch</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="darkMode"
                checked={settings.darkMode}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">Dark Mode (Coming Soon)</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🗑️ Daten</h2>
          
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Alle Einstellungen zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}
