import { useState, useEffect } from 'react';
import SearchService from '../../services/SearchService';

export default function SearchResults({ query, filters, onResultClick }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query && query.length >= 2) {
      search();
    }
  }, [query, filters]);

  const search = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await SearchService.search(query, filters);
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      todo: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      done: 'bg-green-100 text-green-700',
      active: 'bg-green-100 text-green-700',
      online: 'bg-green-100 text-green-700',
      idle: 'bg-yellow-100 text-yellow-700',
      offline: 'bg-gray-100 text-gray-700'
    };

    const labels = {
      todo: 'Offen',
      in_progress: 'In Arbeit',
      done: 'Erledigt',
      active: 'Aktiv',
      online: 'Online',
      idle: 'Leerlauf',
      offline: 'Offline'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs ${styles[priority] || 'bg-gray-100'}`}>
        {priority === 'high' ? '🔴 Hoch' : priority === 'medium' ? '🟡 Mittel' : '🟢 Niedrig'}
      </span>
    );
  };

  const handleResultClick = (result) => {
    if (onResultClick) {
      onResultClick(result);
    }
  };

  if (!query || query.length < 2) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🔍</div>
        <p>Bitte geben Sie mindestens 2 Zeichen ein</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Fehler bei der Suche: {error}
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { totalResults, results: searchResults } = results;

  if (totalResults === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🔍</div>
        <p>Keine Ergebnisse für "{query}" gefunden</p>
      </div>
    );
  }

  const resultSections = [
    { title: 'Projekte', items: searchResults.projects, icon: '📁', empty: 'Keine Projekte gefunden' },
    { title: 'Aufgaben', items: searchResults.tasks, icon: '✅', empty: 'Keine Aufgaben gefunden' },
    { title: 'Kontexte', items: searchResults.contexts, icon: '📝', empty: 'Keine Kontexte gefunden' },
    { title: 'Agenten', items: searchResults.agents, icon: '🤖', empty: 'Keine Agenten gefunden' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold">{totalResults}</span> Ergebnisse für "{query}"
        </p>
      </div>

      {resultSections.map((section) => (
        section.items.length > 0 && (
          <div key={section.title} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-2">
              <span className="text-xl">{section.icon}</span>
              <h3 className="font-semibold text-gray-800">{section.title}</h3>
              <span className="ml-auto bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {section.items.length}
              </span>
            </div>

            <div className="divide-y">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleResultClick(item)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800">{item.name || item.title || item.filename}</h4>
                        {item.status && getStatusBadge(item.status)}
                        {item.priority && getPriorityBadge(item.priority)}
                      </div>
                      
                      {(item.description || item.content) && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description || item.content}
                        </p>
                      )}

                      {item.type === 'agent' && (
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(item.status)}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-sm text-gray-400">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
