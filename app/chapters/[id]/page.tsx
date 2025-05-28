import { PrismaClient } from '@prisma/client';
import ChapterClient from './chapterClient';

const prisma = new PrismaClient();

// type ChapterPageProps = {
//   params: {
//     id: string;
//   };
// };

// const getChaptersByDocumentId = async (documentId: number) => {
//   try {
//     return await prisma.chapter.findMany({
//       where: { documentId },
//       select: {
//         id: true,
//         name: true,
//         filePath: true,
//         document: true,
//         documentId: true,
//       },
//     });
//   } catch (error) {
//     console.error('Error fetching chapters:', error);
//     return [];
//   }
// };

// const getDocuments = async () => {
//   return await prisma.document.findMany();
// };

// export default async function ChapterPage({ params }: ChapterPageProps) {
//   const documentId = Number(params.id);

//   const [chapters, documents] = await Promise.all([
//     getChaptersByDocumentId(documentId),
//     getDocuments(),
//   ]);

//   return <ChapterClient chapters={chapters} documents={documents} />;
// }

// app/chapters/[id]/page.tsx

export default async function Page({ params }: { params: { id: string } }) {
  const documentId = Number(params.id);

  const chapters = await prisma.chapter.findMany({
    where: { documentId },
    select: {
      id: true,
      name: true,
      filePath: true,
      document: true,
      documentId: true,
    },
  });

  const documents = await prisma.document.findMany();

  return <ChapterClient chapters={chapters} documents={documents} />;
}
