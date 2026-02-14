import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Navigation from './components/Navigation/Navigation'
import Overview from './components/Overview/Overview'
import Projects from './components/Projects/Projects'
import TaskBoard from './components/Projects/TaskBoard'
import Context from './components/Context/Context'
import Agents from './pages/Agents'
import Settings from './components/Settings/Settings'
import FileManager from './pages/FileManager'
import Monitoring from './pages/Monitoring'
import SearchPage from './pages/SearchPage'
import Login from './pages/Login'
import Register from './pages/Register'
import KanbanBoard from './pages/KanbanBoard'
import ContextEditor from './pages/ContextEditor'
import MemoryEditor from './pages/MemoryEditor'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <div className="min-h-screen bg-gray-100">
          <Header />
          <div className="flex">
            <Navigation />
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<TaskBoard />} />
                <Route path="/kanban" element={<KanbanBoard />} />
                <Route path="/context" element={<Context />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/files" element={<FileManager />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/search" element={<SearchPage />} />
		<Route path="/context-editor" element={<ContextEditor />} />
		<Route path="/memory" element={<MemoryEditor />} />
              </Routes>
            </main>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App
