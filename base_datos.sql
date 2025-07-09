-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.examenes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  titulo text,
  dificultad text,
  estado text DEFAULT 'pendiente'::text,
  fecha_inicio timestamp with time zone DEFAULT now(),
  fecha_fin timestamp with time zone,
  tiempo_tomado_segundos integer,
  numero_preguntas integer,
  numero_correctas integer,
  puntaje_porcentaje numeric,
  datos jsonb,
  descripcion text,
  tiempo_limite_segundos integer,
  respuestas_usuario jsonb,
  feedback jsonb,
  questions_pinned jsonb,
  is_pinned boolean,
  CONSTRAINT examenes_pkey PRIMARY KEY (id),
  CONSTRAINT examenes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  name text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
