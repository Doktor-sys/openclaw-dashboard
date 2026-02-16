const supabase = require('../config/supabase');

const mockActivities = [
  { id: 1, type: 'task', message: 'Task "Dashboard entwerfen" wurde erstellt', status: 'info', created_at: new Date().toISOString() },
  { id: 2, type: 'auth', message: 'Neuer Benutzer registriert', status: 'success', created_at: new Date().toISOString() },
  { id: 3, type: 'system', message: 'Backend-Server gestartet', status: 'info', created_at: new Date().toISOString() }
];
let activityCounter = 4;

const useMock = () => !supabase;

exports.getActivities = async (req, res) => {
  try {
    if (useMock()) {
      const { limit = 10 } = req.query;
      return res.json(mockActivities.slice(0, limit));
    }

    const { limit = 10 } = req.query;
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createActivity = async (type, message, status = 'info') => {
  try {
    if (useMock()) {
      const newActivity = {
        id: activityCounter++,
        type,
        message,
        status,
        created_at: new Date().toISOString()
      };
      mockActivities.unshift(newActivity);
      return;
    }

    await supabase
      .from('activities')
      .insert([{
        type,
        message,
        status
      }]);
  } catch (error) {
    console.error('Fehler beim Erstellen der Aktivität:', error.message);
  }
};

exports.getActivity = async (req, res) => {
  try {
    if (useMock()) {
      const activity = mockActivities.find(a => a.id === parseInt(req.params.id));
      if (activity) {
        return res.json(activity);
      }
      return res.status(404).json({ error: 'Activity not found' });
    }

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
