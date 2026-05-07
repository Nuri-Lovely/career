-- SQL Schema for Nurai - Skill-to-Career Bridge

-- Enable RLS
-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_kk TEXT NOT NULL,
  description_kk TEXT,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Career Library Table
CREATE TABLE IF NOT EXISTS career_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_kk TEXT NOT NULL,
  summary_kk TEXT NOT NULL,
  technical_skills TEXT[] DEFAULT '{}',
  soft_skills TEXT[] DEFAULT '{}',
  image_url TEXT,
  mentor_name TEXT,
  mentor_location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Results Table (The "Bridge")
CREATE TABLE IF NOT EXISTS user_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_subjects TEXT[] NOT NULL,
  selected_hobby TEXT NOT NULL,
  career_id UUID REFERENCES career_library(id),
  ai_explanation TEXT NOT NULL,
  ai_roadmap JSONB,
  ai_simulation JSONB,
  ai_project_starter TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Profiles for custom data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  grade_level INTEGER,
  avatar_url TEXT,
  traits TEXT[] DEFAULT '{}', -- Saved personality traits
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Portfolio Table
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT,
  project_type TEXT, -- 'AI Suggestion' or 'Self Initiated'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Update user_results to include traits used in generation
ALTER TABLE user_results ADD COLUMN IF NOT EXISTS selected_traits TEXT[] DEFAULT '{}';

-- Mock Data for Subjects
INSERT INTO subjects (name_kk, description_kk, icon, category) VALUES
('Математика', 'Логикалық ойлау мен сандар әлемі.', 'Sigma', 'Science'),
('Көркем еңбек', 'Шығармашылық пен дизайн негіздері.', 'Palette', 'Art'),
('География', 'Әлемнің құрылысы мен мемлекеттер.', 'Globe', 'Social'),
('Информатика', 'Кодтау мен цифрлық технологиялар.', 'Code', 'Tech'),
('Тарих', 'Өткен уақыт пен оқиғалар тізбегі.', 'History', 'Social'),
('Физика', 'Табиғат заңдылықтары мен механика.', 'Dna', 'Science'),
('Әдебиет', 'Сөз өнері мен сыни ойлау.', 'BookOpen', 'Art'),
('Биология', 'Тірі ағзалар мен экосистема.', 'Activity', 'Science');

-- Policies (Simplified for development)
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON subjects FOR SELECT USING (true);

ALTER TABLE career_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON career_library FOR SELECT USING (true);

ALTER TABLE user_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read" ON user_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert" ON user_results FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read/write" ON profiles USING (auth.uid() = id);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual read" ON portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow individual insert" ON portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow individual delete" ON portfolios FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Allow individual update" ON portfolios FOR UPDATE USING (auth.uid() = user_id);
