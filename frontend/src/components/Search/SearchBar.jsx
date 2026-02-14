import { useState, useRef, useEffect } from 'react';
import SearchService from '../../services/SearchService';

export default function SearchBar({ onSearch, placeholder = 'Suche...', showFilters = true }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: '',
    priority: '',
    project: ''
  });
  const [projects, setProjects] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadFilters();
    loadProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadFilters = async () => {
    try {
      const data = await SearchService.getFilters();
      setFilters(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Fehler beim Laden der Filter:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Fehler beim Laden der Projekte:', error);
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      const data = await SearchService.getSuggestions(value);
      setSuggestions(data);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setShowDropdown(false);
      if (onSearch) {
        onSearch(query, filters);
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    setShowDropdown(false);
    if (onSearch) {
      onSearch(suggestion.text, filters);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: '📁',
      task: '✅',
      context: '📝',
      agent: '🤖'
    };
    return icons[type] || '📄';
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 2 && setShowDropdown(true)}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            Suchen
          </button>
        </div>

        {showDropdown && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto"
          >
            <div className="p-2 border-b bg-gray-50">
              <p className="text-xs text-gray-500">Vorschläge</p>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                <span className="flex-1">{suggestion.text}</span>
                <span className="text-xs text-gray-400 capitalize">{suggestion.type}</span>
              </button>
            ))}
          </div>
        )}
      </form>

      {showFilters && (
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Alle Typen</option>
            <option value="projects">Projekte</option>
            <option value="tasks">Aufgaben</option>
            <option value="contexts">Kontexte</option>
            <option value="agents">Agenten</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Alle Status</option>
            <option value="todo">Offen</option>
            <option value="in_progress">In Arbeit</option>
            <option value="done">Erledigt</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Alle Prioritäten</option>
            <option value="high">Hoch</option>
            <option value="medium">Mittel</option>
            <option value="low">Niedrig</option>
          </select>

          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Alle Projekte</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
