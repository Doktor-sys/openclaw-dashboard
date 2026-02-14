import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const COLUMNS = {
  todo: { id: 'todo', title: 'Offen', color: 'bg-gray-100' },
  in_progress: { id: 'in_progress', title: 'In Arbeit', color: 'bg-blue-100' },
  review: { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  done: { id: 'done', title: 'Erledigt', color: 'bg-green-100' }
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Fehler beim Laden der Aufgaben:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    ));

    try {
      await fetch(`http://localhost:3002/api/tasks/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    }
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Kanban-Board</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          + Neue Aufgabe
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {Object.values(COLUMNS).map(column => (
            <div key={column.id} className={`rounded-lg p-4 ${column.color}`}>
              <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                {column.title}
                <span className="bg-white px-2 py-0.5 rounded-full text-sm">
                  {getTasksByStatus(column.id).length}
                </span>
              </h2>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-white/50 rounded' : ''}`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-800">{task.title}</h3>
                              {task.priority && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                              <span>📅 {task.created_at ? new Date(task.created_at).toLocaleDateString('de-DE') : '-'}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
