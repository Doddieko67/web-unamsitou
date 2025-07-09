import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Leer y ejecutar el schema
const schemaSQL = fs.readFileSync('./src/database/schema.sql', 'utf8');

console.log('🔄 Ejecutando schema de base de datos...');
console.log('📄 SQL a ejecutar:');
console.log(schemaSQL);

// Dividir el SQL en comandos individuales
const commands = schemaSQL.split(';').filter(cmd => cmd.trim());

async function executeSchema() {
  for (const command of commands) {
    if (command.trim()) {
      console.log(`\n🔄 Ejecutando: ${command.trim().substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command.trim() });
        
        if (error) {
          console.error('❌ Error:', error);
          continue;
        }
        
        console.log('✅ Comando ejecutado correctamente');
      } catch (err) {
        console.error('❌ Error de ejecución:', err);
      }
    }
  }
  
  console.log('\n🎉 Schema completado');
}

executeSchema();