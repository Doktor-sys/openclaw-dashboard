import { useState, useEffect } from 'react';
import { AVAILABLE_MODELS, DEFAULT_AGENTS } from '../constants/models';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'general',
    model: 'minimax-m2.1-free',
    description: ''
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/agents');
      const data = await response.json();
      const hasOpenClawBot = data.find(a => a.name === 'OpenClaw Bot');
      if (hasOpenClawBot) {
        setAgents(data);
      } else {
        setAgents([...DEFAULT_AGENTS, ...data]);
      }
    } catch (error) {
      setAgents(DEFAULT_AGENTS);
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    try {
      await fetch('http://localhost:3002/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      setShowCreateModal(false);
      setNewAgent({ name: '', type: 'general', model: 'minimax-m2.1-free', description: '' });
      loadAgents();
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
    }
  };

  const openConfig = (agent) => {
    setSelectedAgent(agent);
    setNewAgent({
      name: agent.name,
      type: agent.type,
      model: agent.model,
      description: agent.description || ''
    });
    setShowConfigModal(true);
  };

  const saveConfig = async () => {
    try {
      await fetch(`http://localhost:3002/api/agents/${selectedAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      });
      setShowConfigModal(false);
      loadAgents();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const deleteAgent = async (agentId) => {
    if (!confirm('Agent wirklich löschen?')) return;
    try {
      await fetch(`http://localhost:3002/api/agents/${agentId}`, {
        method: 'DELETE'
      });
      loadAgents();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getModelIcon = (modelId) => {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    return model ? model.icon : '🤖';
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
        <h1 className="text-2xl font-bold text-gray-800">🤖 Agenten-Verwaltung</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Neuer Agent
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    agent.type === 'coding' ? 'bg-blue-100' : 
                    agent.type === 'research' ? 'bg-green-100' : 
                    agent.type === 'analysis' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {agent.type === 'coding' ? '💻' : agent.type === 'research' ? '🔍' : agent.type === 'analysis' ? '📊' : '🤖'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`}></div>
                  <span className="text-sm text-gray-600">{agent.status}</span>
                </div>
              </div>

              {agent.description && (
                <p className="text-sm text-gray-600 mb-4">{agent.description}</p>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getModelIcon(agent.model)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {AVAILABLE_MODELS.find(m => m.id === agent.model)?.name || agent.model}
                    </p>
                    <p className="text-xs text-gray-500">
                      {AVAILABLE_MODELS.find(m => m.id === agent.model)?.provider || ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Aufgaben:</span>
                  <span className="font-medium">{agent.tasks_completed || 0}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <button 
                  onClick={() => openConfig(agent)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  ⚙️ Konfigurieren
                </button>
                <button 
                  onClick={() => deleteAgent(agent.id)}
                  className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  🗑️ Löschen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Neuer Agent</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Agent Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={newAgent.type}
                  onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Allgemein</option>
                  <option value="coding">Coding</option>
                  <option value="research">Research</option>
                  <option value="analysis">Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KI-Modell</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.icon} {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Beschreibung..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={createAgent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfigModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">⚙️ Agent Konfigurieren</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                <select
                  value={newAgent.type}
                  onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Allgemein</option>
                  <option value="coding">Coding</option>
                  <option value="research">Research</option>
                  <option value="analysis">Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KI-Modell</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({ ...newAgent, model: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AVAILABLE_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.icon} {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={saveConfig}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                💾 Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
