import { useState, useEffect } from 'react';

export default function MemoryEditor() {
  const [memory, setMemory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    loadMemory();
  }, []);

  const loadMemory = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/context/files/Memory.md');
      const data = await response.json();
      setMemory(data.content || '');
    } catch (error) {
      console.error('Fehler beim Laden:', error);
      setMemory('# Memory\n\nHier steht das Langzeitgedächtnis des Bots...');
    } finally {
      setLoading(false);
    }
  };

  const saveMemory = async () => {
    setSaving(true);
    try {
      await fetch('http://localhost:3002/api/context/files/Memory.md', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: memory })
      });
      setLastSaved(new Date());
      alert('Memory gespeichert! ✅');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern! ❌');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧠 Memory Editor</h1>
          <p className="text-gray-500">Langzeitgedächtnis des OpenClaw Bots</p>
        </div>
        <button
          onClick={saveMemory}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Speichert...' : '💾 Speichern'}
        </button>
      </div>

      {lastSaved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          Zuletzt gespeichert: {lastSaved.toLocaleString('de-DE')}
        </div>
      )}

      <textarea
        value={memory}
        onChange={(e) => setMemory(e.target.value)}
        className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="# Memory\n\nHier kannst du wichtige Informationen eingeben..."
      />

      <div className="mt-4 text-sm text-gray-500">
        💡 Tipp: Verwende Markdown-Formatierung für Überschriften, Listen und Formatierungen.
      </div>
    </div>
  );
}
