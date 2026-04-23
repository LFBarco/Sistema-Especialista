// KV Store deshabilitado - Sistema funciona sin Supabase

const mockStore: { [key: string]: any } = {};

export const set = async (key: string, value: any): Promise<void> => {
  mockStore[key] = value;
};

export const get = async (key: string): Promise<any> => {
  return mockStore[key];
};

export const del = async (key: string): Promise<void> => {
  delete mockStore[key];
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  keys.forEach((key, i) => mockStore[key] = values[i]);
};

export const mget = async (keys: string[]): Promise<any[]> => {
  return keys.map(key => mockStore[key]);
};

export const mdel = async (keys: string[]): Promise<void> => {
  keys.forEach(key => delete mockStore[key]);
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  return Object.keys(mockStore)
    .filter(key => key.startsWith(prefix))
    .map(key => mockStore[key]);
};
