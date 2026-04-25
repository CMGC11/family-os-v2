type AppEnv = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  hasSupabaseConfig: boolean;
};

function readEnvValue(key: string) {
  const value = import.meta.env[key];

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

export const env: AppEnv = {
  supabaseUrl: readEnvValue('VITE_SUPABASE_URL'),
  supabaseAnonKey: readEnvValue('VITE_SUPABASE_ANON_KEY'),
  hasSupabaseConfig:
    Boolean(readEnvValue('VITE_SUPABASE_URL')) &&
    Boolean(readEnvValue('VITE_SUPABASE_ANON_KEY')),
};