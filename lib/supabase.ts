import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iloyrkxaljbevkfnqcqa.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb3lya3hhbGpiZXZrZm5xY3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzODk0MTYsImV4cCI6MjA1ODk2NTQxNn0.7aJnzIPnhgObqy1fI18XKb25bCXZCmqYvOno5RM6Fhs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Alimento {
  id: string;
  codigo: string;
  nombre: string;
  calorias: number;
  proteinas?: number;
  grasas?: number;
  carbohidratos?: number;
  azucares?: number;
  fibra?: number;
  sodio?: number;
  imagen_url?: string;
  created_at: string;
}

export const foodDB = {
  async getFoodByBarcode(codigo: string): Promise<Alimento | null> {
    try {
      console.log('Iniciando búsqueda para código:', codigo);
      const { data, error } = await supabase
        .from('alimentos')
        .select('*')
        .eq('codigo', codigo)
        .single();
      
      if (error) {
        console.log('Error de Supabase:', error);
        if (error.code === 'PGRST116') {
          // No rows found is expected when scanning new products
          console.log('No se encontró el producto en la base de datos');
          return null;
        }
        throw error;
      }
      
      console.log('Datos encontrados:', data);
      return data;
    } catch (error) {
      console.error('Error fetching alimento:', error);
      throw error;
    }
  },

  async addFood(alimento: Omit<Alimento, 'id' | 'created_at'>): Promise<Alimento | null> {
    const { data, error } = await supabase
      .from('alimentos')
      .insert([alimento])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding alimento:', error);
      return null;
    }
    
    return data;
  },

  async searchFoods(query: string): Promise<Alimento[]> {
    const { data, error } = await supabase
      .from('alimentos')
      .select('id, nombre, codigo, calorias, proteinas, carbohidratos, grasas, azucares, fibra, sodio, imagen_url, created_at')
      .ilike('nombre', `%${query}%`)
      .order('nombre')
      .limit(10);
    
    if (error) {
      console.error('Error searching alimentos:', error);
      return [];
    }
    
    return data;
  },

  async updateFood(id: string, updates: Partial<Alimento>): Promise<Alimento | null> {
    const { data, error } = await supabase
      .from('alimentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating alimento:', error);
      return null;
    }
    
    return data;
  }
};
