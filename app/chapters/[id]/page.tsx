import { prisma } from '@/lib/prisma';
import ChapterClient from './chapterClient';


export default async function Page({ params }: { params: { id: string } }) {
  // Tambahkan 'await' di sini
  const { id } = await params; // Destrukturisasi id dari params yang sudah di-await
  const documentId = Number(id); // Gunakan id yang sudah di-destrukturisasi

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