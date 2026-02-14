import { NavLink } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { path: '/', label: 'Übersicht', icon: '📊' },
  { path: '/projects', label: 'Projekte', icon: '📁' },
  { path: '/tasks', label: 'Aufgaben', icon: '✅' },
  { path: '/kanban', label: 'Kanban', icon: '📋' },
  { path: '/files', label: 'Dateien', icon: '📤' },
  { path: '/monitoring', label: 'Monitoring', icon: '📈' },
  { path: '/search', label: 'Suche', icon: '🔍' },
  { path: '/context', label: 'Kontext', icon: '📝' },
  { path: '/agents', label: 'Agenten', icon: '🤖' },
  { path: '/settings', label: 'Einstellungen', icon: '⚙️' }
]

export default function Navigation() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <nav className={`bg-white shadow-lg ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 min-h-[calc(100vh-72px)]`}>
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="w-full py-4 border-b flex justify-center hover:bg-gray-50"
      >
        {collapsed ? '→' : '←'}
      </button>
      
      <ul className="py-4">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 transition-colors
                ${isActive ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600' : 'text-gray-700 hover:bg-gray-100'}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}