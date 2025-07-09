import { supabase } from '../supabase.config';

/**
 * Función para testear la conexión con Supabase y verificar permisos
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testeando conexión con Supabase...');
    
    // 1. Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError);
      return { success: false, error: 'Error de autenticación' };
    }
    
    if (!user) {
      console.warn('⚠️ Usuario no autenticado');
      return { success: false, error: 'Usuario no autenticado' };
    }
    
    console.log('✅ Usuario autenticado:', user.email);
    
    // 2. Verificar acceso a tabla user_api_keys
    const { data, error } = await supabase
      .from('user_api_keys')
      .select('id, service, is_active, created_at')
      .eq('user_id', user.id)
      .limit(1);
    
    if (error) {
      console.error('❌ Error accediendo a user_api_keys:', error);
      return { 
        success: false, 
        error: `Error accediendo a la tabla: ${error.message}` 
      };
    }
    
    console.log('✅ Acceso a tabla user_api_keys exitoso');
    console.log('📊 Datos encontrados:', data);
    
    // 3. Test de inserción (si no hay datos)
    if (data.length === 0) {
      console.log('🧪 Testeando inserción...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('user_api_keys')
        .insert({
          user_id: user.id,
          service: 'test',
          api_key: 'test-key-123',
          is_active: false
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error en test de inserción:', insertError);
        return { 
          success: false, 
          error: `Error de inserción: ${insertError.message}` 
        };
      }
      
      console.log('✅ Test de inserción exitoso:', insertData);
      
      // Limpiar test
      await supabase
        .from('user_api_keys')
        .delete()
        .eq('id', insertData.id);
      
      console.log('🧹 Test data limpiada');
    }
    
    return { 
      success: true, 
      message: 'Conexión con Supabase exitosa',
      userId: user.id,
      email: user.email
    };
    
  } catch (error) {
    console.error('💥 Error inesperado:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

// Función para ejecutar test desde consola del navegador
(window as any).testSupabase = testSupabaseConnection;