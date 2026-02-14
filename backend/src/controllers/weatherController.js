const getWeatherIcon = (condition) => {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️', 
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️'
  };
  return icons[condition] || '🌡️';
};

const cities = [
  { id: 2988507, name: 'Paris', country: 'FR' },
  { id: 2643743, name: 'London', country: 'GB' },
  { id: 2800866, name: 'Brussels', country: 'BE' }
];

exports.getWeatherData = async (req, res) => {
  try {
    // Simuliertes Wetter für Test
    const mockData = cities.map(city => ({
      id: city.id,
      name: city.name,
      country: city.country,
      temperature: Math.floor(Math.random() * 25) + 5,
      humidity: Math.floor(Math.random() * 50) + 30,
      windSpeed: Math.floor(Math.random() * 15) + 5,
      condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
      timestamp: new Date().toISOString()
    }));

    res.json({
      success: true,
      data: mockData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.getWeatherIcon = getWeatherIcon;