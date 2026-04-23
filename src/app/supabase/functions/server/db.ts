
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);
const TABLE_NAME = 'kv_store_91d1f360';

export const get = async (key: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error getting key:', key, error);
      return null;
    }
    return data?.value;
  } catch (e) {
    console.error('Exception getting key:', key, e);
    return null;
  }
};

export const set = async (key: string, value: any) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert({ key, value });
    if (error) {
        console.error('Error setting key:', key, error);
        throw error;
    }
  } catch (e) {
    console.error('Exception setting key:', key, e);
    throw e;
  }
};

export const del = async (key: string) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('key', key);
    if (error) throw error;
  } catch (e) {
    console.error('Exception deleting key:', key, e);
    throw e;
  }
};

export const getByPrefix = async (prefix: string) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('key, value')
      .like('key', `${prefix}%`);
    
    if (error) {
        console.error('Error getting by prefix:', prefix, error);
        return [];
    }
    return data.map(item => item.value);
  } catch (e) {
    console.error('Exception getting by prefix:', prefix, e);
    return [];
  }
};

export const getKeysByPrefix = async (prefix: string) => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('key, value')
        .like('key', `${prefix}%`);
      
      if (error) {
          console.error('Error getting keys by prefix:', prefix, error);
          return [];
      }
      return data; // Returns {key, value} objects
    } catch (e) {
      console.error('Exception getting keys by prefix:', prefix, e);
      return [];
    }
  };
