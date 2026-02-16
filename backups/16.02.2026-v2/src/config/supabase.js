const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

console.log('[Supabase] URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'not set');
console.log('[Supabase] Key:', supabaseKey ? '***' : 'not set');

let supabase = null;

if (supabaseUrl && supabaseUrl.match(/^https?:\/\//)) {
  console.log('[Supabase] Initializing client...');
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('[Supabase] Running in DEMO/MOCK mode');
}

module.exports = supabase;