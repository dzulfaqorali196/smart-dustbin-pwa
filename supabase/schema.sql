-- Schema untuk tabel bins
CREATE TABLE IF NOT EXISTS bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  max_capacity INT NOT NULL DEFAULT 100,
  current_capacity INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latitude DOUBLE PRECISION NULL,
  longitude DOUBLE PRECISION NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_bins_status ON bins(status);
CREATE INDEX IF NOT EXISTS idx_bins_user_id ON bins(user_id);

-- Schema untuk tabel alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('FULL', 'MAINTENANCE', 'INACTIVE')),
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE NULL
);

-- Indexes untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_alerts_bin_id ON alerts(bin_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);

-- Schema untuk tabel collections (catatan pengumpulan sampah)
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bin_id UUID NOT NULL REFERENCES bins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  fill_level_before INT NOT NULL,
  notes TEXT NULL,
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_collections_bin_id ON collections(bin_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(collected_at);

-- Row Level Security (RLS) untuk bins
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;

-- Semua pengguna dapat melihat bins
CREATE POLICY "Semua dapat melihat bins" ON bins
FOR SELECT USING (true);

-- Hanya pemilik yang dapat mengedit atau menghapus bins
CREATE POLICY "Pemilik dapat mengedit bins" ON bins
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Pemilik dapat menghapus bins" ON bins
FOR DELETE USING (auth.uid() = user_id);

-- Row Level Security (RLS) untuk collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Semua pengguna dapat melihat collections
CREATE POLICY "Semua dapat melihat collections" ON collections 
FOR SELECT USING (true);

-- Hanya petugas yang melakukan pengumpulan yang dapat mengedit/menghapus
CREATE POLICY "Petugas dapat mengedit collections" ON collections
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Petugas dapat menghapus collections" ON collections
FOR DELETE USING (auth.uid() = user_id);

-- Function untuk service backend yang dapat memperbarui bins
CREATE OR REPLACE FUNCTION update_bin_from_iot()
RETURNS TRIGGER AS $$
BEGIN
    -- Kode di sini dapat melakukan validasi tambahan
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_bin_from_iot
BEFORE UPDATE ON bins
FOR EACH ROW
EXECUTE FUNCTION update_bin_from_iot();

-- Function untuk membuat collection otomatis ketika bin dikosongkan (current_capacity turun signifikan)
CREATE OR REPLACE FUNCTION create_collection_on_emptying()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.current_capacity > 50 AND NEW.current_capacity < 10 THEN
        INSERT INTO collections (bin_id, fill_level_before)
        VALUES (OLD.id, OLD.current_capacity);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_bin_emptied
AFTER UPDATE ON bins
FOR EACH ROW
EXECUTE FUNCTION create_collection_on_emptying();

-- Contoh data awal untuk testing
INSERT INTO bins (name, location, max_capacity, current_capacity, status, latitude, longitude)
VALUES 
  ('Bin #DT-001', 'Jl. Gatot Subroto No. 12', 100, 75, 'ACTIVE', -6.2088, 106.8456),
  ('Bin #DT-002', 'Jl. Sudirman No. 45', 100, 30, 'ACTIVE', -6.2150, 106.8316),
  ('Bin #DT-003', 'Taman Menteng', 100, 90, 'ACTIVE', -6.1957, 106.8322);

-- Contoh data alerts
INSERT INTO alerts (bin_id, alert_type, priority, status, created_at)
VALUES 
  ((SELECT id FROM bins WHERE name = 'Bin #DT-003'), 'FULL', 'HIGH', 'OPEN', NOW()); 