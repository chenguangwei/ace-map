const readEnv = (key: string) => process.env[key]?.trim() || null;

export const supabaseEnv = {
	url: readEnv('NEXT_PUBLIC_SUPABASE_URL'),
	anonKey: readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
	serviceRoleKey: readEnv('SUPABASE_SERVICE_ROLE_KEY'),
	databaseUrl: readEnv('DATABASE_URL')
};

export const isSupabaseConfigured = () =>
	Boolean(supabaseEnv.url && supabaseEnv.anonKey);
