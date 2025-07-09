-- Tabla para almacenar las API keys de los usuarios
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service VARCHAR(50) NOT NULL, -- 'gemini', 'openai', etc.
    api_key TEXT NOT NULL, -- Almacenada encriptada
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para mejorar performance
    UNIQUE(user_id, service)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_service ON user_api_keys(service);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_active ON user_api_keys(is_active);

-- Políticas de Row Level Security (RLS)
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden acceder a sus propias API keys
CREATE POLICY "users_can_access_own_api_keys" ON user_api_keys
    FOR ALL USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE user_api_keys IS 'Almacena las API keys de servicios externos para cada usuario';
COMMENT ON COLUMN user_api_keys.user_id IS 'ID del usuario propietario de la API key';
COMMENT ON COLUMN user_api_keys.service IS 'Nombre del servicio (gemini, openai, etc.)';
COMMENT ON COLUMN user_api_keys.api_key IS 'API key encriptada en base64';
COMMENT ON COLUMN user_api_keys.is_active IS 'Indica si la API key está activa';