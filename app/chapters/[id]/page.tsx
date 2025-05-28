import { prisma } from '@/lib/prisma';
import ChapterClient from './chapterClient';

// Definisi props untuk Page Component
// Ini adalah cara standar Next.js App Router untuk mendefinisikan props
interface PageProps {
  params: {
    id: string;
  };
  // Jika ada search params, Anda juga bisa menuliskannya di sini:
  // searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function Page({ params }: PageProps) {
  // Di sini, 'params.id' seharusnya sudah tersedia secara langsung
  // TANPA perlu 'await params' atau 'await props.params'
  const documentId = Number(params.id);

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