import React, { useState, useEffect } from 'react';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30000); // Alle 30s aktualisieren
    return () => clearInterval(interval);
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/weather/data');
      const data = await response.json();
      
      if (data.success) {
        setWeatherData(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Wetterdaten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-xl">🌤️ Wetterdaten werden geladen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-xl text-red-500">❌ Fehler: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">🌤️ Wetter Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {weatherData.map((city) => (
          <div key={city.id} className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-lg shadow-lg text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-lg font-bold">{city.name}</h2>
                <p className="text-sm opacity-80">{city.country}</p>
              </div>
              <div className="text-2xl">
                {city.condition === 'Clear' ? '☀️' : 
                 city.condition === 'Clouds' ? '☁️' : 
                 city.condition === 'Rain' ? '🌧️' : '🌤️'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {city.temperature}°C
              </div>
              
              <div className="text-sm capitalize">
                {city.condition}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="opacity-80">💧 Luftfeuchte:</span>
                  <span className="font-semibold ml-1">{city.humidity}%</span>
                </div>
                <div>
                  <span className="opacity-80">💨 Wind:</span>
                  <span className="font-semibold ml-1">{city.windSpeed} m/s</span>
                </div>
              </div>
              
              <div className="text-xs opacity-60 mt-2">
                {new Date(city.timestamp).toLocaleString('de-DE')}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={fetchWeather}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Aktualisieren
        </button>
      </div>
    </div>
  );
};

export default WeatherApp;