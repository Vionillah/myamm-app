// components/HomepageContent.tsx
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import AuthButtons from './AuthButtons';
import { User } from '@supabase/supabase-js'; // Import User type

type Document = {
  id: number;
  name: string;
  alias: string | null;
  // Tambahkan properti lain di sini jika ada di skema Prisma Anda dan Anda membutuhkannya
};

// HomepageContent sekarang menerima user prop
export default async function HomepageContent({ documents, user }: { documents: Document[], user: User | null }) {
  return (
    <div>
      {/* Teruskan objek user ke AuthButtons */}
      <AuthButtons user={user} />
      <div className='items-center justify-center pt-3 pb-10 px-10'>
        <div className='relative z-10'>
          <div className='text-center mb-10'>
            <Image
              src="/Logo.png"
              alt="Boeing 737"
              width={240}
              height={150}
              className="mx-auto mb-4"
            />
            <div className='text-center text-3xl font-bold mb-10 text-blue-950'>Boeing-737</div>
          </div>
          <div className="flex items-center justify-center">
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10'>
              {documents.map((doc) => (
              <a className="card shadow-lg min-h-[150px] " key={doc.id} href={`/chapters/${doc.id}`}>
                <div className='bg-sky-800 text-blue-950 text-center bg-opacity-60 p-4 rounded-t-xl'>
                  <h2 className="text-3xl font-bold">{doc.name}</h2>
                </div>
                <div className=' text-center p-4 rounded-b-xl'>
                  <h2 className="text-gray-800">{doc.alias}</h2>
                </div>
              </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};