// lib/supabase.ts
// Ini adalah client Supabase untuk Client Components
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'; // Pastikan import ini

export const createClient = () => {
  // Anda tidak perlu argumen cookies di sini, karena ini untuk sisi client
  return createClientComponentClient();
};