/*
  # LGS Takip Sistemi Veritabanı Şeması

  1. Yeni Tablolar
    - `users` - Kullanıcı bilgileri (Supabase Auth ile entegre)
    - `subjects` - Ders bilgileri (Türkçe, Matematik, vb.)
    - `daily_entries` - Günlük soru girişleri
    - `subject_entries` - Her ders için günlük detaylar

  2. Güvenlik
    - Tüm tablolarda RLS aktif
    - Kullanıcılar sadece kendi verilerini görebilir
    - Authenticated kullanıcılar için CRUD politikaları

  3. İlişkiler
    - daily_entries -> users (user_id)
    - subject_entries -> daily_entries (daily_entry_id)
    - subject_entries -> subjects (subject_id)
*/

-- Users tablosu (Supabase Auth ile entegre)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Dersler tablosu
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Günlük girişler tablosu
CREATE TABLE IF NOT EXISTS daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entry_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Ders bazında günlük detaylar
CREATE TABLE IF NOT EXISTS subject_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_entry_id uuid REFERENCES daily_entries(id) ON DELETE CASCADE NOT NULL,
  subject_id text REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  total_questions integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  wrong_answers integer NOT NULL DEFAULT 0,
  blank_answers integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(daily_entry_id, subject_id)
);

-- RLS politikalarını etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_entries ENABLE ROW LEVEL SECURITY;

-- Users tablosu politikaları
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Subjects tablosu politikaları (herkese okuma izni)
CREATE POLICY "Anyone can read subjects"
  ON subjects
  FOR SELECT
  TO authenticated
  USING (true);

-- Daily entries politikaları
CREATE POLICY "Users can read own entries"
  ON daily_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON daily_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON daily_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON daily_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Subject entries politikaları
CREATE POLICY "Users can read own subject entries"
  ON subject_entries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries 
      WHERE daily_entries.id = subject_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own subject entries"
  ON subject_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_entries 
      WHERE daily_entries.id = subject_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own subject entries"
  ON subject_entries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries 
      WHERE daily_entries.id = subject_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own subject entries"
  ON subject_entries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_entries 
      WHERE daily_entries.id = subject_entries.daily_entry_id 
      AND daily_entries.user_id = auth.uid()
    )
  );

-- Varsayılan dersleri ekle
INSERT INTO subjects (id, name, color, order_index) VALUES
  ('turkce', 'Türkçe', '#EF4444', 1),
  ('matematik', 'Matematik', '#3B82F6', 2),
  ('fen', 'Fen Bilgisi', '#10B981', 3),
  ('sosyal', 'Sosyal Bilgiler', '#F59E0B', 4),
  ('din', 'Din Kültürü ve Ahlak Bilgisi', '#8B5CF6', 5),
  ('ingilizce', 'İngilizce', '#EC4899', 6)
ON CONFLICT (id) DO NOTHING;

-- Trigger fonksiyonu: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_entries_updated_at
  BEFORE UPDATE ON subject_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();