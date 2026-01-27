import { supabase } from './supabase';

// File Upload Helper
export const uploadFile = async (bucket, file, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
  
  return publicUrl;
};

// Farm Profile
export const saveFarmProfile = async (walletAddress, profileData) => {
  const { data, error } = await supabase
    .from('farm_profiles')
    .upsert({ wallet_address: walletAddress, ...profileData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getFarmProfile = async (walletAddress) => {
  const { data, error } = await supabase
    .from('farm_profiles')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Animals
export const addAnimal = async (farmId, animalData) => {
  const { data, error } = await supabase
    .from('animals')
    .insert({ farm_id: farmId, ...animalData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getAnimals = async (farmId) => {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Production Logs
export const addProductionLog = async (farmId, logData) => {
  const { data, error } = await supabase
    .from('production_logs')
    .insert({ farm_id: farmId, ...logData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getProductionLogs = async (farmId, startDate, endDate) => {
  let query = supabase
    .from('production_logs')
    .select('*')
    .eq('farm_id', farmId);
  
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Inventory
export const updateInventory = async (farmId, inventoryData) => {
  const { data, error } = await supabase
    .from('inventory')
    .upsert({ farm_id: farmId, ...inventoryData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getInventory = async (farmId) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('farm_id', farmId);
  
  if (error) throw error;
  return data;
};

// Financial Records
export const addFinancialRecord = async (farmId, recordData) => {
  const { data, error } = await supabase
    .from('financial_records')
    .insert({ farm_id: farmId, ...recordData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getFinancialRecords = async (farmId, startDate, endDate) => {
  let query = supabase
    .from('financial_records')
    .select('*')
    .eq('farm_id', farmId);
  
  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Quality Records
export const addQualityRecord = async (farmId, recordData) => {
  const { data, error } = await supabase
    .from('quality_records')
    .insert({ farm_id: farmId, ...recordData })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getQualityRecords = async (farmId) => {
  const { data, error } = await supabase
    .from('quality_records')
    .select('*')
    .eq('farm_id', farmId)
    .order('test_date', { ascending: false });
  
  if (error) throw error;
  return data;
};
