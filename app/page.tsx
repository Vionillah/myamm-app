// app/page.tsx
import { getSession } from '@/lib/auth'; // Ini sekarang akan mengembalikan User | null
import HomepageContent from './components/HomepageContent';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ini penting untuk mencegah caching Server Component

export default async function Home() {
  const user = await getSession(); // Mengambil objek user yang terautentikasi

  const documents = await prisma.document.findMany();

  return (
    <main className="relative min-h-screen w-full bg-plane">
      <div className='absolute inset-0 bg-white bg-opacity-80 z-0'/>
      {/* Teruskan objek user ke HomepageContent */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center"> {/* Tambahkan wrapper untuk HomepageContent */}
        <HomepageContent documents={documents} user={user} />
      </div>
    </main>
  );
}