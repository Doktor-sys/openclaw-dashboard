import { useState, useEffect } from 'react'

export default function TaskBoard() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [projects, setProjects] = useState([])
  const [filter, setFilter] = useState('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    status: 'todo',
    priority: 'medium'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksData, projectsData] = await Promise.all([
        fetch('http://localhost:3002/api/tasks').then(r => r.json()),
        fetch('http://localhost:3002/api/projects').then(r => r.json())
      ])
      setTasks(tasksData)
      setProjects(projectsData)
      setLoading(false)
    } catch (error) {
      console.error('Fehler beim Laden:', error)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingTask) {
        await fetch(`http://localhost:3002/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch('http://localhost:3002/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      }
      setShowModal(false)
      setEditingTask(null)
      setFormData({
        title: '',
        description: '',
        project_id: '',
        status: 'todo',
        priority: 'medium'
      })
      loadData()
    } catch (error) {
      console.error('Fehler:', error)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      project_id: task.project_id || '',
      status: task.status,
      priority: task.priority
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Möchten Sie diese Aufgabe wirklich löschen?')) {
      try {
        await fetch(`http://localhost:3002/api/tasks/${id}`, {
          method: 'DELETE'
        })
        loadData()
      } catch (error) {
        console.error('Fehler beim Löschen:', error)
      }
    }
  }

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const taskId = parseInt(e.dataTransfer.getData('taskId'))
    
    try {
      await fetch(`http://localhost:3002/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      loadData()
    } catch (error) {
      console.error('Fehler beim Verschieben:', error)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 border-gray-300',
      in_progress: 'bg-blue-50 border-blue-300',
      done: 'bg-green-50 border-green-300'
    }
    return colors[status] || colors.todo
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700'
    }
    return colors[priority] || colors.medium
  }

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter)

  const columns = [
    { id: 'todo', title: 'Offen', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Arbeit', color: 'bg-blue-50' },
    { id: 'done', title: 'Erledigt', color: 'bg-green-50' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Aufgaben</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle</option>
            <option value="todo">Offen</option>
            <option value="in_progress">In Arbeit</option>
            <option value="done">Erledigt</option>
          </select>
          <button
            onClick={() => {
              setEditingTask(null)
              setFormData({
                title: '',
                description: '',
                project_id: projects[0]?.id || '',
                status: 'todo',
                priority: 'medium'
              })
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Neue Aufgabe
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`rounded-lg p-4 min-h-[400px] ${column.color}`}
            onDrop={(e) => handleDrop(e, column.id)}
            onDragOver={handleDragOver}
          >
            <h3 className="font-semibold mb-4 text-gray-700 flex items-center justify-between">
              {column.title}
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                {filteredTasks.filter(t => t.status === column.id).length}
              </span>
            </h3>
            <div className="space-y-3">
              {filteredTasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className={`bg-white rounded-lg p-4 shadow-sm border cursor-move hover:shadow-md transition-shadow ${getStatusColor(task.status)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{projects.find(p => p.id === task.project_id)?.name || 'Kein Projekt'}</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(task)} className="text-blue-600 hover:underline">Bearbeiten</button>
                        <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:underline">Löschen</button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projekt</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Kein Projekt</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todo">Offen</option>
                    <option value="in_progress">In Arbeit</option>
                    <option value="done">Erledigt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTask ? 'Speichern' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
