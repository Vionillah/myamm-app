// app/chapters/[id]/page.tsx
import { prisma } from '@/lib/prisma';
import ChapterClient from './chapterClient';
import { getSession } from '@/lib/auth'; // Import getSession (yang sekarang mengembalikan User)

export const dynamic = 'force-dynamic'; // Ini penting untuk mencegah caching Server Component

interface ChapterPageProps {
  params: {
    id: string;
  };
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const documentId = parseInt(params.id);
  const user = await getSession(); // Dapatkan user untuk halaman ini

  const chapters = await prisma.chapter.findMany({
    where: { documentId: documentId },
    orderBy: { id: 'asc' },
  });

  const documents = await prisma.document.findMany(); // Perlu ini untuk AddChapter/UpdateChapter

  return (
    <div className='relative z-10'>
      <ChapterClient chapters={chapters} documents={documents} session={user} /> {/* Teruskan user sebagai session */}
    </div>
  );
}