const supabase = require('../config/supabase');

const mockContexts = [
  { id: 1, filename: 'project_guidelines.md', content: 'OpenClaw Project Guidelines...', updated_at: new Date().toISOString() },
  { id: 2, filename: 'api_documentation.md', content: 'API Documentation...', updated_at: new Date().toISOString() }
];
let contextCounter = 3;

const useMock = () => !supabase;

exports.getContexts = async (req, res) => {
  try {
    if (useMock()) {
      return res.json(mockContexts);
    }

    const { data, error } = await supabase
      .from('contexts')
      .select('*')
      .order('filename', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContext = async (req, res) => {
  try {
    if (useMock()) {
      const context = mockContexts.find(c => c.filename === req.params.filename);
      if (context) {
        return res.json(context);
      }
      return res.status(404).json({ error: 'Context not found' });
    }

    const { data, error } = await supabase
      .from('contexts')
      .select('*')
      .eq('filename', req.params.filename)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContext = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockContexts.findIndex(c => c.filename === req.params.filename);
      if (index !== -1) {
        mockContexts[index] = { ...mockContexts[index], ...req.body, updated_at: new Date().toISOString() };
        return res.json(mockContexts[index]);
      }
      return res.status(404).json({ error: 'Context not found' });
    }

    const { data, error } = await supabase
      .from('contexts')
      .upsert({
        filename: req.params.filename,
        content: req.body.content,
        updated_at: new Date()
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createContext = async (req, res) => {
  try {
    if (useMock()) {
      const newContext = {
        id: contextCounter++,
        ...req.body,
        updated_at: new Date().toISOString()
      };
      mockContexts.push(newContext);
      return res.json(newContext);
    }

    const { data, error } = await supabase
      .from('contexts')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContext = async (req, res) => {
  try {
    if (useMock()) {
      const index = mockContexts.findIndex(c => c.filename === req.params.filename);
      if (index !== -1) {
        mockContexts.splice(index, 1);
        return res.json({ message: 'Context deleted' });
      }
      return res.status(404).json({ error: 'Context not found' });
    }

    const { error } = await supabase
      .from('contexts')
      .delete()
      .eq('filename', req.params.filename);

    if (error) throw error;
    res.json({ message: 'Context deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
