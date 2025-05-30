// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js'; // Ini adalah createClient dari library utama supabase-js
import { SupabaseClient } from '@supabase/supabase-js';

export const createAdminClient = (): SupabaseClient => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) { // Pastikan ini juga dicek
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};