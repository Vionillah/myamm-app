// lib/auth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js'; // Import tipe User dari supabase-js

export const createClient = () => {
  return createServerComponentClient({
    // Cukup berikan referensi ke fungsi 'cookies' di sini
    cookies: cookies,
    // Pastikan URL dan Key juga disediakan, meski tidak terlihat dalam kutipan Anda,
    // createServerComponentClient membutuhkannya.
    // Contoh eksplisit (opsional jika sudah otomatis dari ENV):
    // supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};

export async function getSession(): Promise<User | null> {
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}