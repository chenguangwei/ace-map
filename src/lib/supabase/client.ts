'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseEnv } from '@/lib/supabase/env';

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = () => {
	if (!isSupabaseConfigured()) return null;
	if (browserClient) return browserClient;

	browserClient = createBrowserClient(
		supabaseEnv.url as string,
		supabaseEnv.anonKey as string
	);

	return browserClient;
};
