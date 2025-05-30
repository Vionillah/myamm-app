// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

export const createServerSideClient = (): SupabaseClient => {
  const cookieStore = cookies();
  // Argumen pertama adalah URL, argumen kedua adalah KEY, argumen ketiga adalah OPTIONS objek
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { // Ini adalah objek options
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (error) { /* handle error */ }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, '', options);
          } catch (error) { /* handle error */ }
        },
      },
    }
  );
};