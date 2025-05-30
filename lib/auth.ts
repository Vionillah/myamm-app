// lib/auth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  return createServerComponentClient(
    {
      cookies: cookies,
    }
  );
};

export async function getSession() { // Nama fungsi ini tidak perlu diubah, tapi isinya akan
  const supabase = createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser(); // <--- GANTI DI SINI
    return user; // <--- KEMBALIKAN OBJEK USER, BUKAN SESI
  } catch (error) {
    console.error('Error getting user data:', error); // Sesuaikan pesan error
    return null;
  }
}