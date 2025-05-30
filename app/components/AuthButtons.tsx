// components/AuthButtons.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js'; // Import User type
import { useRouter } from 'next/navigation';
import LoginModal from './LoginModal';

// Menerima 'user' sebagai prop
export default function AuthButtons({ user }: { user: User | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient(); // Client-side client

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Tetap panggil refresh setelah logout
  };

  return (
    <div className="flex justify-end gap-2 mr-10">
      {!user ? ( // Cek keberadaan objek user
        <button onClick={() => setIsModalOpen(true)} className="btn btn-outline btn-primary">
          Login Admin
        </button>
      ) : (
        <button onClick={handleLogout} className="btn btn-outline btn-secondary">
          Logout Admin
        </button>
      )}

      <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}