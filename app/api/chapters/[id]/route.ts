import { unlinkSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Hapus atau komen out interface RouteParams
// interface RouteParams {
//   params: {
//     id: string;
//   };
// }

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => { // Tipe inline di sini
  try {
    const { id } = params; // Dapatkan 'id' dari params yang disalurkan Next.js
    const chapter = Number(id);

    if (isNaN(chapter)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const formData = await req.formData();

    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    const documentId = Number(formData.get('documentId'));

    if (!name || !documentId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let filePath: string | undefined = undefined;

    if (file && file.size > 0) {
      const existingChapter = await prisma.chapter.findUnique({
        where: {
          id: chapter,
        },
        select: {
          filePath: true,
        },
      });

      if (existingChapter?.filePath) {
        const oldPath = path.join(process.cwd(), 'public', existingChapter.filePath);
        if (existsSync(oldPath)) {
          try {
            unlinkSync(oldPath);
          } catch (unlinkError) {
            console.error(`Failed to delete old file ${oldPath}:`, unlinkError);
          }
        }
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name}`;
      filePath = `uploads/${filename}`;
      const fullPath = path.join(process.cwd(), 'public', filePath);

      await writeFile(fullPath, buffer);
    }

    const updatedChapter = await prisma.chapter.update({
      where: {
        id: chapter,
      },
      data: {
        name,
        documentId,
        ...(filePath ? { filePath } : {}),
      },
    });

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => { // Tipe inline di sini
  try {
    const { id } = params;
    const chapter = Number(id);

    if (isNaN(chapter)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    const existingChapter = await prisma.chapter.findUnique({
      where: {
        id: chapter,
      },
      select: {
        filePath: true,
      },
    });

    if (existingChapter?.filePath) {
      const oldPath = path.join(process.cwd(), 'public', existingChapter.filePath);
      if (existsSync(oldPath)) {
        try {
          unlinkSync(oldPath);
        } catch (unlinkError) {
          console.error(`Failed to delete old file ${oldPath} during DELETE:`, unlinkError);
        }
      }
    }

    await prisma.chapter.delete({
      where: {
        id: chapter,
      },
    });
    return NextResponse.json({ message: `Chapter with ID ${id} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};