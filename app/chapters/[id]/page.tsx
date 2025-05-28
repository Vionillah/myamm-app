import { prisma } from '@/lib/prisma';
import ChapterClient from './chapterClient';

// Next.js tampaknya menghasilkan tipe internal yang mengharuskan 'params' adalah Promise.
// Jadi, kita akan menyesuaikan PageProps kita agar sesuai dengan ekspektasi tersebut.
interface PageProps {
  // Ini adalah penyesuaian yang tidak lazim, tapi berdasarkan error yang Anda alami
  params: Promise<{ id: string }>; // Next.js mengeluh 'params' harus Promise
  // Jika ada search params, Anda juga bisa menuliskannya di sini:
  // searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: PageProps) {
  // Karena kita mendeklarasikan params sebagai Promise, kita harus meng-await-nya
  // untuk mendapatkan nilai sebenarnya dari id.
  const resolvedParams = await params;
  
  const documentId = Number(resolvedParams.id);

  const [chapters, documents] = await Promise.all([
    prisma.chapter.findMany({
      where: { documentId },
      select: {
        id: true,
        name: true,
        filePath: true,
        document: true,
        documentId: true,
      },
    }),
    prisma.document.findMany(),
  ]);

  return <ChapterClient chapters={chapters} documents={documents} />;
}