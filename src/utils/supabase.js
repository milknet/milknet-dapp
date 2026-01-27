import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKETS = {
  FARM_DOCS: 'farm-documents',
  ANIMAL_PHOTOS: 'animal-photos',
  LAB_REPORTS: 'lab-reports',
  CERTIFICATIONS: 'certifications',
  INVOICES: 'invoices'
};
