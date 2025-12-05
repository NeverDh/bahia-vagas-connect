-- Add new values to experience_level enum
ALTER TYPE experience_level ADD VALUE IF NOT EXISTS 'auxiliar';
ALTER TYPE experience_level ADD VALUE IF NOT EXISTS 'assistente';
ALTER TYPE experience_level ADD VALUE IF NOT EXISTS 'freelancer';
ALTER TYPE experience_level ADD VALUE IF NOT EXISTS 'jovem_aprendiz';