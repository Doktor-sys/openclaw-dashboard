import { useState, useEffect } from 'react';

export default function ContextEditor() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/context/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Fehler beim Laden der Dateien:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filename) => {
    try {
      const response = await fetch(`http://localhost:3002/api/context/files/${filename}`);
      const data = await response.json();
      setSelectedFile(filename);
      setContent(data.content || '');
    } catch (error) {
      console.error('Fehler beim Laden des Inhalts:', error);
    }
  };

  const saveContent = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      await fetch(`http://localhost:3002/api/context/files/${selectedFile}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      alert('Gespeichert! ✅');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern! ❌');
    } finally {
      setSaving(false);
    }
  };

  const createNewFile = async () => {
    const filename = prompt('Dateiname (z.B. neues_context.md):');
    if (!filename) return;
    try {
      await fetch('http://localhost:3002/api/context/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: '# ' + filename + '\n\n' })
      });
      loadFiles();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
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
        <h1 className="text-2xl font-bold text-gray-800">📝 Kontext-Editor</h1>
        <button 
          onClick={createNewFile}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neue Datei
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <h2 className="font-semibold text-gray-700 mb-4">📁 Dateien</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {files.length === 0 ? (
              <p className="p-4 text-gray-500">Keine Dateien gefunden</p>
            ) : (
              <ul className="divide-y">
                {files.map(file => (
                  <li key={file}>
                    <button
                      onClick={() => loadFileContent(file)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                        selectedFile === file ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span>📄</span>
                      <span className="flex-1 truncate">{file}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-span-3">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">📝 {selectedFile}</h2>
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Speichert...' : '💾 Speichern'}
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[600px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Markdown-Inhalt hier eingeben..."
              />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">Wähle eine Datei aus oder erstelle eine neue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
