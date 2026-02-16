const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

let GENERATED_DIR = process.env.OPENCLAW_PATH || '/openclaw/generated';

// Versuche das Verzeichnis zu erstellen
try {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    console.log(`[CodeGenerator] Using directory: ${GENERATED_DIR}`);
  }
} catch (error) {
  console.warn(`[CodeGenerator] Cannot use ${GENERATED_DIR}, using fallback`);
  // Fallback auf /tmp
  GENERATED_DIR = path.join(os.tmpdir(), 'openclaw_generated');
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
  console.log(`[CodeGenerator] Fallback directory: ${GENERATED_DIR}`);
}

// Aktive Generierungs-Jobs
const activeJobs = new Map();

// App-Templates
const appTemplates = {
  weather: {
    name: 'WetterApp',
    component: `import React, { useState, useEffect } from 'react';

const WeatherApp = () => {
  const [cities, setCities] = useState([
    { name: 'London', temp: 15, condition: 'Rainy', country: 'UK' },
    { name: 'Paris', temp: 18, condition: 'Cloudy', country: 'FR' },
    { name: 'Brussels', temp: 16, condition: 'Sunny', country: 'BE' }
  ]);

  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshWeather = () => {
    setLoading(true);
    setTimeout(() => {
      setCities(prev => prev.map(city => ({
        ...city,
        temp: Math.floor(Math.random() * 15) + 10
      })));
      setLastUpdate(new Date());
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(refreshWeather, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>🌤️ Weather Dashboard</h1>
      <p style={{ textAlign: 'center', color: '#6b7280' }}>
        Last updated: {lastUpdate.toLocaleTimeString()}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {cities.map(city => (
          <div key={city.name} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3>{city.name} {city.country}</h3>
            <div style={{ fontSize: '36px', margin: '10px 0' }}>{city.temp}°C</div>
            <div>{city.condition}</div>
          </div>
        ))}
      </div>

      <button 
        onClick={refreshWeather}
        disabled={loading}
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px 20px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? 'Loading...' : '🔄 Refresh'}
      </button>
    </div>
  );
};

export default WeatherApp;`,
    readme: `# Weather App

Eine React Wetter-App für London, Paris und Brüssel.

## Features
- Live Wetterdaten (simuliert)
- Automatische Aktualisierung alle 30 Sekunden
- Responsive Design

## Installation
\`\`\`bash
npm install
npm start
\`\`\`

## Verwendung
Die App zeigt das aktuelle Wetter für drei europäische Städte an.`,
    packageJson: {
      name: 'weather-app',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build'
      }
    },
    standaloneHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Dashboard</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;

        const WeatherApp = () => {
            const [cities, setCities] = useState([
                { name: 'London', temp: 15, condition: 'Rainy', country: 'UK' },
                { name: 'Paris', temp: 18, condition: 'Cloudy', country: 'FR' },
                { name: 'Brussels', temp: 16, condition: 'Sunny', country: 'BE' }
            ]);

            const [loading, setLoading] = useState(false);
            const [lastUpdate, setLastUpdate] = useState(new Date());

            const refreshWeather = () => {
                setLoading(true);
                setTimeout(() => {
                    setCities(prev => prev.map(city => ({
                        ...city,
                        temp: Math.floor(Math.random() * 15) + 10
                    })));
                    setLastUpdate(new Date());
                    setLoading(false);
                }, 1000);
            };

            useEffect(() => {
                const interval = setInterval(refreshWeather, 30000);
                return () => clearInterval(interval);
            }, []);

            return (
                <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{ textAlign: 'center', color: '#2563eb' }}>🌤️ Weather Dashboard</h1>
                    <p style={{ textAlign: 'center', color: '#6b7280' }}>
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                        {cities.map(city => (
                            <div key={city.name} style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <h3>{city.name} {city.country}</h3>
                                <div style={{ fontSize: '36px', margin: '10px 0' }}>{city.temp}°C</div>
                                <div>{city.condition}</div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={refreshWeather}
                        disabled={loading}
                        style={{
                            display: 'block',
                            margin: '20px auto',
                            padding: '10px 20px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? 'Loading...' : '🔄 Refresh'}
                    </button>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<WeatherApp />);
    </script>
</body>
</html>`
  },
  
  todo: {
    name: 'TodoApp',
    component: `import React, { useState } from 'react';

const TodoApp = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build an App', completed: false },
    { id: 3, text: 'Deploy to Production', completed: false }
  ]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2563eb' }}>✅ Todo List</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add new task..."
          style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '8px'
          }}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {todos.map(todo => (
          <div key={todo.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '8px',
            borderLeft: todo.completed ? '4px solid #10b981' : '4px solid #f59e0b'
          }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              style={{ cursor: 'pointer' }}
            />
            <span style={{
              flex: 1,
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#9ca3af' : '#1f2937'
            }}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{
                padding: '5px 10px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
        {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
      </div>
    </div>
  );
};

export default TodoApp;`,
    readme: `# Todo App

Eine einfache React Todo-Liste.

## Features
- Aufgaben hinzufügen
- Aufgaben als erledigt markieren
- Aufgaben löschen
- Fortschrittsanzeige`,
    packageJson: {
      name: 'todo-app',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      }
    },
    standaloneHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todo List</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState } = React;

        const TodoApp = () => {
            const [todos, setTodos] = useState([
                { id: 1, text: 'Learn React', completed: false },
                { id: 2, text: 'Build an App', completed: false },
                { id: 3, text: 'Deploy to Production', completed: false }
            ]);
            const [inputValue, setInputValue] = useState('');

            const addTodo = () => {
                if (inputValue.trim()) {
                    setTodos([...todos, {
                        id: Date.now(),
                        text: inputValue,
                        completed: false
                    }]);
                    setInputValue('');
                }
            };

            const toggleTodo = (id) => {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, completed: !todo.completed } : todo
                ));
            };

            const deleteTodo = (id) => {
                setTodos(todos.filter(todo => todo.id !== id));
            };

            return (
                <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    <h1 style={{ textAlign: 'center', color: '#2563eb' }}>✅ Todo List</h1>
                    
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                            placeholder="Add new task..."
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px'
                            }}
                        />
                        <button
                            onClick={addTodo}
                            style={{
                                padding: '10px 20px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Add
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {todos.map(todo => (
                            <div key={todo.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '15px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                borderLeft: todo.completed ? '4px solid #10b981' : '4px solid #f59e0b'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={todo.completed}
                                    onChange={() => toggleTodo(todo.id)}
                                    style={{ cursor: 'pointer' }}
                                />
                                <span style={{
                                    flex: 1,
                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                    color: todo.completed ? '#9ca3af' : '#1f2937'
                                }}>
                                    {todo.text}
                                </span>
                                <button
                                    onClick={() => deleteTodo(todo.id)}
                                    style={{
                                        padding: '5px 10px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
                        {todos.filter(t => !t.completed).length} of {todos.length} tasks remaining
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<TodoApp />);
    </script>
</body>
</html>`
  },

  calculator: {
    name: 'Calculator',
    component: `import React, { useState } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num) => {
    if (isNewNumber) {
      setDisplay(num.toString());
      setIsNewNumber(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  };

  const calculate = () => {
    try {
      const fullEquation = equation + display;
      const result = eval(fullEquation);
      setDisplay(result.toString());
      setEquation('');
      setIsNewNumber(true);
    } catch (error) {
      setDisplay('Error');
      setIsNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const buttons = [
    { label: 'C', action: clear, type: 'clear' },
    { label: '÷', action: () => handleOperator('/'), type: 'operator' },
    { label: '×', action: () => handleOperator('*'), type: 'operator' },
    { label: '⌫', action: () => setDisplay(display.slice(0, -1) || '0'), type: 'operator' },
    { label: '7', action: () => handleNumber(7), type: 'number' },
    { label: '8', action: () => handleNumber(8), type: 'number' },
    { label: '9', action: () => handleNumber(9), type: 'number' },
    { label: '-', action: () => handleOperator('-'), type: 'operator' },
    { label: '4', action: () => handleNumber(4), type: 'number' },
    { label: '5', action: () => handleNumber(5), type: 'number' },
    { label: '6', action: () => handleNumber(6), type: 'number' },
    { label: '+', action: () => handleOperator('+'), type: 'operator' },
    { label: '1', action: () => handleNumber(1), type: 'number' },
    { label: '2', action: () => handleNumber(2), type: 'number' },
    { label: '3', action: () => handleNumber(3), type: 'number' },
    { label: '=', action: calculate, type: 'equals' },
    { label: '0', action: () => handleNumber(0), type: 'number', wide: true },
    { label: '.', action: () => handleNumber('.'), type: 'number' },
  ];

  return (
    <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ 
        background: '#1f2937', 
        padding: '20px', 
        borderRadius: '16px',
        width: '300px'
      }}>
        <div style={{ 
          background: '#374151', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '15px',
          textAlign: 'right'
        }}>
          <div style={{ color: '#9ca3af', fontSize: '14px', minHeight: '20px' }}>
            {equation}
          </div>
          <div style={{ color: 'white', fontSize: '32px', wordBreak: 'break-all' }}>
            {display}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              style={{
                padding: '15px',
                fontSize: '20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                gridColumn: btn.wide ? 'span 2' : 'span 1',
                background: 
                  btn.type === 'clear' ? '#ef4444' :
                  btn.type === 'operator' ? '#f59e0b' :
                  btn.type === 'equals' ? '#10b981' : '#4b5563',
                color: 'white'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calculator;`,
    readme: `# Calculator

Ein einfacher React Taschenrechner.

## Features
- Grundrechenarten (+, -, *, /)
- Klare Anzeige
- Responsive Design`,
    packageJson: {
      name: 'calculator',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      }
    },
    standaloneHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculator</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState } = React;

        const Calculator = () => {
            const [display, setDisplay] = useState('0');
            const [equation, setEquation] = useState('');
            const [isNewNumber, setIsNewNumber] = useState(true);

            const handleNumber = (num) => {
                if (isNewNumber) {
                    setDisplay(num.toString());
                    setIsNewNumber(false);
                } else {
                    setDisplay(display + num);
                }
            };

            const handleOperator = (op) => {
                setEquation(display + ' ' + op + ' ');
                setIsNewNumber(true);
            };

            const calculate = () => {
                try {
                    const fullEquation = equation + display;
                    const result = eval(fullEquation);
                    setDisplay(result.toString());
                    setEquation('');
                    setIsNewNumber(true);
                } catch (error) {
                    setDisplay('Error');
                    setIsNewNumber(true);
                }
            };

            const clear = () => {
                setDisplay('0');
                setEquation('');
                setIsNewNumber(true);
            };

            const buttons = [
                { label: 'C', action: clear, type: 'clear' },
                { label: '÷', action: () => handleOperator('/'), type: 'operator' },
                { label: '×', action: () => handleOperator('*'), type: 'operator' },
                { label: '⌫', action: () => setDisplay(display.slice(0, -1) || '0'), type: 'operator' },
                { label: '7', action: () => handleNumber(7), type: 'number' },
                { label: '8', action: () => handleNumber(8), type: 'number' },
                { label: '9', action: () => handleNumber(9), type: 'number' },
                { label: '-', action: () => handleOperator('-'), type: 'operator' },
                { label: '4', action: () => handleNumber(4), type: 'number' },
                { label: '5', action: () => handleNumber(5), type: 'number' },
                { label: '6', action: () => handleNumber(6), type: 'number' },
                { label: '+', action: () => handleOperator('+'), type: 'operator' },
                { label: '1', action: () => handleNumber(1), type: 'number' },
                { label: '2', action: () => handleNumber(2), type: 'number' },
                { label: '3', action: () => handleNumber(3), type: 'number' },
                { label: '=', action: calculate, type: 'equals' },
                { label: '0', action: () => handleNumber(0), type: 'number', wide: true },
                { label: '.', action: () => handleNumber('.'), type: 'number' },
            ];

            return (
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                        background: '#1f2937', 
                        padding: '20px', 
                        borderRadius: '16px',
                        width: '300px'
                    }}>
                        <div style={{ 
                            background: '#374151', 
                            padding: '20px', 
                            borderRadius: '8px', 
                            marginBottom: '15px',
                            textAlign: 'right'
                        }}>
                            <div style={{ color: '#9ca3af', fontSize: '14px', minHeight: '20px' }}>
                                {equation}
                            </div>
                            <div style={{ color: 'white', fontSize: '32px', wordBreak: 'break-all' }}>
                                {display}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                            {buttons.map((btn, idx) => (
                                <button
                                    key={idx}
                                    onClick={btn.action}
                                    style={{
                                        padding: '15px',
                                        fontSize: '20px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        gridColumn: btn.wide ? 'span 2' : 'span 1',
                                        background: 
                                            btn.type === 'clear' ? '#ef4444' :
                                            btn.type === 'operator' ? '#f59e0b' :
                                            btn.type === 'equals' ? '#10b981' : '#4b5563',
                                        color: 'white'
                                    }}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<Calculator />);
    </script>
</body>
</html>`
  },

  clock: {
    name: 'ClockApp',
    component: `import React, { useState, useEffect } from 'react';

const ClockApp = () => {
  const [time, setTime] = useState(new Date());
  const [format24, setFormat24] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    if (!format24) {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return { hours: hours.toString().padStart(2, '0'), minutes, seconds, ampm };
    }
    
    return { hours: hours.toString().padStart(2, '0'), minutes, seconds, ampm: null };
  };

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('de-DE', options);
  };

  const { hours, minutes, seconds, ampm } = formatTime(time);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        minWidth: '350px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '30px', fontSize: '24px' }}>
          Digital Clock
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#2563eb',
            fontFamily: 'monospace',
            letterSpacing: '4px'
          }}>
            {hours}:{minutes}:{seconds}
          </div>
          {!format24 && ampm && (
            <div style={{ 
              fontSize: '24px', 
              color: '#666',
              marginTop: '5px'
            }}>
              {ampm}
            </div>
          )}
        </div>

        <div style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '30px',
          padding: '10px',
          background: '#f3f4f6',
          borderRadius: '8px'
        }}>
          {formatDate(time)}
        </div>

        <button
          onClick={() => setFormat24(!format24)}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.target.style.background = '#2563eb'}
        >
          {format24 ? 'Switch to 12h Format' : 'Switch to 24h Format'}
        </button>

        <div style={{ 
          marginTop: '20px', 
          fontSize: '12px', 
          color: '#999'
        }}>
          UTC Offset: {time.getTimezoneOffset() / -60} hours
        </div>
      </div>
    </div>
  );
};

export default ClockApp;`,
    readme: `# Digital Clock App

Eine elegante Digitaluhr mit React.

## Features
- Echtzeit-Anzeige mit Sekunden
- 12h/24h Format-Umschaltung
- Datumsanzeige auf Deutsch
- Zeitzone-Anzeige
- Responsive Design`,
    packageJson: {
      name: 'clock-app',
      version: '1.0.0',
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      }
    },
    standaloneHtml: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Clock</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;

        const ClockApp = () => {
            const [time, setTime] = useState(new Date());
            const [format24, setFormat24] = useState(false);

            useEffect(() => {
                const timer = setInterval(() => {
                    setTime(new Date());
                }, 1000);
                return () => clearInterval(timer);
            }, []);

            const formatTime = (date) => {
                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const seconds = date.getSeconds().toString().padStart(2, '0');
                
                if (!format24) {
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    return { hours: hours.toString().padStart(2, '0'), minutes, seconds, ampm };
                }
                
                return { hours: hours.toString().padStart(2, '0'), minutes, seconds, ampm: null };
            };

            const formatDate = (date) => {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                return date.toLocaleDateString('de-DE', options);
            };

            const { hours, minutes, seconds, ampm } = formatTime(time);

            return (
                <div style={{ 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '40px',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        textAlign: 'center',
                        minWidth: '350px'
                    }}>
                        <h1 style={{ color: '#333', marginBottom: '30px', fontSize: '24px' }}>
                            Digital Clock
                        </h1>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                fontSize: '72px',
                                fontWeight: 'bold',
                                color: '#2563eb',
                                fontFamily: 'monospace',
                                letterSpacing: '4px'
                            }}>
                                {hours}:{minutes}:{seconds}
                            </div>
                            {!format24 && ampm && (
                                <div style={{ 
                                    fontSize: '24px', 
                                    color: '#666',
                                    marginTop: '5px'
                                }}>
                                    {ampm}
                                </div>
                            )}
                        </div>

                        <div style={{
                            fontSize: '18px',
                            color: '#666',
                            marginBottom: '30px',
                            padding: '10px',
                            background: '#f3f4f6',
                            borderRadius: '8px'
                        }}>
                            {formatDate(time)}
                        </div>

                        <button
                            onClick={() => setFormat24(!format24)}
                            style={{
                                padding: '10px 20px',
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            {format24 ? 'Switch to 12h Format' : 'Switch to 24h Format'}
                        </button>

                        <div style={{ 
                            marginTop: '20px', 
                            fontSize: '12px', 
                            color: '#999'
                        }}>
                            UTC Offset: {time.getTimezoneOffset() / -60} hours
                        </div>
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<ClockApp />);
    </script>
</body>
</html>`
  }
};

// Code-Generierung starten
exports.generateApp = async (req, res) => {
  const { appType, jobId } = req.body;
  
  if (!appTemplates[appType]) {
    return res.status(400).json({ error: 'Unknown app type' });
  }

  const template = appTemplates[appType];
  const appDir = path.join(GENERATED_DIR, template.name);
  
  // Job initialisieren
  activeJobs.set(jobId, {
    id: jobId,
    type: appType,
    status: 'in_progress',
    progress: 0,
    message: 'Starting generation...',
    filePath: appDir
  });

  // Asynchrone Generierung
  generateAppFiles(jobId, template, appDir);

  res.json({ 
    success: true, 
    message: 'App generation started',
    jobId,
    filePath: appDir
  });
};

// App-Dateien generieren
async function generateAppFiles(jobId, template, appDir) {
  const steps = [
    { progress: 10, message: 'Creating directory structure...', action: () => {
      if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir, { recursive: true });
      }
    }},
    { progress: 30, message: 'Generating main component...', action: () => {
      fs.writeFileSync(
        path.join(appDir, `${template.name}.jsx`),
        template.component
      );
    }},
    { progress: 50, message: 'Creating README...', action: () => {
      fs.writeFileSync(
        path.join(appDir, 'README.md'),
        template.readme
      );
    }},
    { progress: 70, message: 'Creating package.json...', action: () => {
      fs.writeFileSync(
        path.join(appDir, 'package.json'),
        JSON.stringify(template.packageJson, null, 2)
      );
    }},
    { progress: 85, message: 'Creating index.html...', action: () => {
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/${template.name}.jsx"></script>
</body>
</html>`;
      fs.writeFileSync(path.join(appDir, 'index.html'), indexHtml);
    }},
    { progress: 95, message: 'Creating standalone HTML...', action: () => {
      if (template.standaloneHtml) {
        fs.writeFileSync(path.join(appDir, 'index-standalone.html'), template.standaloneHtml);
      }
    }},
    { progress: 100, message: 'Generation complete!', action: () => {
      // Job als abgeschlossen markieren
      const job = activeJobs.get(jobId);
      if (job) {
        job.status = 'completed';
        job.progress = 100;
        job.message = 'App successfully created!';
      }
    }}
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    // Status aktualisieren
    const job = activeJobs.get(jobId);
    if (job) {
      job.progress = step.progress;
      job.message = step.message;
    }

    // Aktion ausführen
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulierte Verarbeitungszeit
      step.action();
    } catch (error) {
      console.error(`Error in step ${i}:`, error);
      if (job) {
        job.status = 'error';
        job.message = `Error: ${error.message}`;
      }
      return;
    }
  }
}

// Job-Status abfragen
exports.getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = activeJobs.get(jobId);
  
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    id: job.id,
    type: job.type,
    status: job.status,
    progress: job.progress,
    message: job.message,
    filePath: job.filePath
  });
};

// Alle generierten Apps auflisten
exports.listGeneratedApps = (req, res) => {
  try {
    if (!fs.existsSync(GENERATED_DIR)) {
      return res.json([]);
    }

    const apps = fs.readdirSync(GENERATED_DIR)
      .filter(name => fs.statSync(path.join(GENERATED_DIR, name)).isDirectory())
      .map(name => {
        const appDir = path.join(GENERATED_DIR, name);
        const stats = fs.statSync(appDir);
        
        return {
          name: name,
          createdAt: stats.birthtime,
          path: appDir,
          files: fs.readdirSync(appDir)
        };
      });

    res.json(apps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};