import { useState, useEffect } from 'react'
import BotControl from '../BotControl/BotControl'

export default function Overview() {
  const [stats, setStats] = useState({
    activeProjects: 0,
    openTasks: 0,
    completedTasks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/tasks')
      ])
      
      const projects = await projectsRes.json()
      const tasks = await tasksRes.json()
      
      setStats({
        activeProjects: projects.filter(p => p.status === 'active').length,
        openTasks: tasks.filter(t => t.status === 'todo').length,
        completedTasks: tasks.filter(t => t.status === 'done').length
      })
    } catch (error) {
      console.error('Fehler:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Übersicht</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Übersicht</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Aktive Projekte</div>
          <div className="text-4xl font-bold text-primary-600 mt-2">{stats.activeProjects}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Offene Aufgaben</div>
          <div className="text-4xl font-bold text-yellow-600 mt-2">{stats.openTasks}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Abgeschlossene Aufgaben</div>
          <div className="text-4xl font-bold text-green-600 mt-2">{stats.completedTasks}</div>
        </div>
      </div>
      
      <BotControl />
    </div>
  )
}