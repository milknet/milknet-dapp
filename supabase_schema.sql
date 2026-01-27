-- Farm Profiles
CREATE TABLE farm_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  farm_name TEXT NOT NULL,
  registration_number TEXT,
  farm_size DECIMAL,
  num_animals INTEGER,
  phone TEXT,
  email TEXT,
  farm_type TEXT CHECK (farm_type IN ('individual', 'cooperative', 'sacco', 'company')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Herd Management
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id),
  tag_number TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  status TEXT DEFAULT 'active',
  avg_daily_yield DECIMAL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Production Records
CREATE TABLE production_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id),
  date DATE NOT NULL,
  morning_yield DECIMAL,
  evening_yield DECIMAL,
  total_yield DECIMAL,
  fat_percentage DECIMAL,
  protein_percentage DECIMAL,
  temperature DECIMAL,
  animals_milked INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id),
  item_name TEXT NOT NULL,
  category TEXT,
  quantity DECIMAL,
  unit TEXT,
  cost DECIMAL,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Financial Records
CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id),
  date DATE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  category TEXT,
  amount DECIMAL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality & Compliance
CREATE TABLE quality_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farm_profiles(id),
  test_date DATE,
  test_type TEXT,
  result TEXT,
  report_url TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
