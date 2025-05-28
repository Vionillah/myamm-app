// app/chapters/[id]/page.tsx
import { PrismaClient } from "@prisma/client";
import ChapterClient from "./chapterClient";

const prisma = new PrismaClient();

const getChaptersByDocumentId = async (documentId: number) => {
  return await prisma.chapter.findMany({
    where: { documentId },
    select: {
      id: true,
      name: true,
      filePath: true,
      document: true,
      documentId: true,
    },
  });
};

const getDocuments = async () => {
  return await prisma.document.findMany();
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const documentId = Number(params.id);

  const [chapters, documents] = await Promise.all([
    getChaptersByDocumentId(documentId),
    getDocuments(),
  ]);

  return <ChapterClient chapters={chapters} documents={documents} />;
}
