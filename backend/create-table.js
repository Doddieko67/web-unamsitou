import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔄 Creando tabla user_api_keys...');

// Crear tabla directamente usando la API
async function createTable() {
  try {
    // Intentar crear la tabla usando una consulta simple
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST106') {
      console.log('✅ Tabla user_api_keys no existe, se debe crear via SQL Editor en Supabase');
      console.log('📋 Ejecuta este SQL en el SQL Editor de Supabase:');
      console.log(`
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service VARCHAR(50) NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, service)
);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_service ON user_api_keys(service);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys(is_active);

ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_access_own_api_keys" ON user_api_keys
    FOR ALL USING (auth.uid() = user_id);
      `);
      
      console.log('🔗 Ve a: https://supabase.com/dashboard/project/lazazrhysqbkgmfqdlug/sql');
      
    } else if (error) {
      console.error('❌ Error consultando tabla:', error);
    } else {
      console.log('✅ Tabla user_api_keys ya existe');
      console.log('📊 Datos de prueba:', data);
    }
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

createTable();