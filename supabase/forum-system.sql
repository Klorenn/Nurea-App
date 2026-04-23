-- =============================================================================
-- NUREA FORO SYSTEM - Tablas para el sistema de foros
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================================

-- Tabla de foros/categorías
CREATE TABLE IF NOT EXISTS forum_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    description_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT DEFAULT '#0f766e',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de posts/preguntas en el foro
CREATE TABLE IF NOT EXISTS forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES forum_categories(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de respuestas/comentarios
CREATE TABLE IF NOT EXISTS forum_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_best_answer BOOLEAN DEFAULT false,
    upvotes_count INTEGER DEFAULT 0,
    downvotes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de votos en respuestas
CREATE TABLE IF NOT EXISTS forum_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reply_id UUID NOT NULL REFERENCES forum_replies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(reply_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_author ON forum_replies(author_id);

-- Row Level Security
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorías (público para leer, solo admins para editar)
CREATE POLICY "categories_public_read" ON forum_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "categories_admin_manage" ON forum_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Políticas RLS para posts
CREATE POLICY "posts_public_read" ON forum_posts
    FOR SELECT USING (status = 'active');

CREATE POLICY "posts_authors_create" ON forum_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "posts_authors_update" ON forum_posts
    FOR UPDATE USING (auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas RLS para respuestas
CREATE POLICY "replies_public_read" ON forum_replies
    FOR SELECT USING (true);

CREATE POLICY "replies_authors_create" ON forum_replies
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "replies_authors_update" ON forum_replies
    FOR UPDATE USING (auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas RLS para votos
CREATE POLICY "votes_users_manage" ON forum_votes
    FOR ALL USING (auth.uid() = user_id);

-- Insertar categorías iniciales
INSERT INTO forum_categories (name, name_en, description, description_en, slug, icon, color, sort_order) VALUES
    ('Salud General', 'General Health', 'Preguntas sobre salud y bienestar general', 'Questions about general health and wellness', 'salud-general', 'Heart', '#0f766e', 1),
    ('Salud Mental', 'Mental Health', 'Espacio para discussiones sobre salud mental', 'Space for mental health discussions', 'salud-mental', 'Brain', '#7c3aed', 2),
    ('Nutrición', 'Nutrition', 'Consejos y preguntas sobre alimentación saludable', 'Tips and questions about healthy eating', 'nutricion', 'Apple', '#16a34a', 3),
    ('Embarazo y Maternidad', 'Pregnancy & Motherhood', 'Consultas sobre embarazo y cuidado infantil', 'Questions about pregnancy and child care', 'embarazo', 'Baby', '#ec4899', 4),
    ('Deportes y Fitness', 'Sports & Fitness', 'Salud relacionada con actividad física', 'Health related to physical activity', 'deportes', 'Dumbbell', '#f59e0b', 5),
    ('Consultas a Especialistas', 'Specialist Questions', 'Preguntas específicas para profesionales de la salud', 'Specific questions for health professionals', 'especialistas', 'Stethoscope', '#3b82f6', 6)
ON CONFLICT (slug) DO NOTHING;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER forum_categories_updated
    BEFORE UPDATE ON forum_categories FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER forum_posts_updated
    BEFORE UPDATE ON forum_posts FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER forum_replies_updated
    BEFORE UPDATE ON forum_replies FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at();

SELECT 'Foro sistema creado exitosamente!' as resultado;