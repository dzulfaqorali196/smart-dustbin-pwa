-- Create a table for bins/smart dustbins
CREATE TABLE IF NOT EXISTS public.bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  max_capacity INT4 DEFAULT 100,
  current_capacity INT4 DEFAULT 0,
  status VARCHAR DEFAULT 'active',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location VARCHAR
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Semua orang dapat melihat tempat sampah
CREATE POLICY "Anyone can view bins" ON public.bins
  FOR SELECT USING (true);

-- Hanya pemilik/admin yang dapat mengubah data tempat sampah  
CREATE POLICY "Owners can update their bins" ON public.bins
  FOR UPDATE USING (auth.uid() = user_id);

-- Hanya pengguna yang terautentikasi yang dapat membuat tempat sampah baru
CREATE POLICY "Authenticated users can insert bins" ON public.bins
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Hanya pemilik yang dapat menghapus tempat sampah
CREATE POLICY "Owners can delete their bins" ON public.bins
  FOR DELETE USING (auth.uid() = user_id);

-- Sample data untuk testing (Jika tabel sudah ada dan memiliki data, hapus bagian ini)
-- INSERT INTO public.bins (name, latitude, longitude, current_capacity, max_capacity, location)
-- VALUES 
--   ('Tempat Sampah A1', -6.175110, 106.865036, 30, 100, 'Di depan Gedung A'),
--   ('Tempat Sampah A2', -6.175039, 106.864382, 75, 100, 'Di samping kantin'),
--   ('Tempat Sampah B1', -6.175596, 106.864522, 45, 100, 'Di taman'),
--   ('Tempat Sampah C1', -6.176255, 106.864865, 20, 100, 'Dekat perpustakaan'); 