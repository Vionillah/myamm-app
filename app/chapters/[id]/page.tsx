// import { prisma } from "@/lib/prisma";
import 'app/globals.css';
import ChapterClient from './chapterClient';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getChaptersByDocumentId = async (documentId: number) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: {documentId},
      select: {
        id: true,
        name: true,
        filePath: true,
        document: true,
        documentId: true,
      },
    });
    return chapters;
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

const getDocuments = async () => {
  return await prisma.document.findMany();
};

export default async function Page ({ params }: { params: { id: string } }) {
  const documentId = Number(params.id);

  const [chapters, documents] = await Promise.all([
    getChaptersByDocumentId(documentId),
    getDocuments(),
  ]);

  return <ChapterClient chapters={chapters} documents={documents} />;
}