import { supabase } from '../config/supabaseClient';

export const energyService = {
  async getLiveConsumption() {
    if (!supabase) throw new Error("Supabase client is not initialized");
    const { data, error } = await supabase
      .from('devices')
      .select(`
        id, 
        name, 
        type, 
        energy_consumption, 
        rooms (name)
      `);
    
    if (error) throw error;
    return data || [];
  }
};