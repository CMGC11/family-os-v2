type AppEnv = {
  supabaseUrl: string;
  supabasePublishableKey: string;
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
  supabasePublishableKey: readEnvValue('VITE_SUPABASE_PUBLISHABLE_KEY'),
  hasSupabaseConfig:
    Boolean(readEnvValue('VITE_SUPABASE_URL')) &&
    Boolean(readEnvValue('VITE_SUPABASE_PUBLISHABLE_KEY')),
};