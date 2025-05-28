import { unlinkSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
// import type { Chapter } from '@prisma/client';

const prisma = new PrismaClient();

export const PATCH = async (req: NextRequest) => {
    const url   = new URL(req.url);
    const id = url.pathname.split('/').pop();
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
        
    if (file && file.size) {
        //Get the existing chapter to check if it has a filePath
        const existingChapter = await prisma.chapter.findUnique({
            where: {
                id: chapter,
            },
            select: {
                filePath: true,
            },
        });

        // Delete the existing file if it exists
        if (existingChapter?.filePath) {
            const oldPath = path.join(process.cwd(), 'public', existingChapter.filePath);
            if (existsSync(oldPath)) {
                unlinkSync(oldPath);
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
            ...(filePath ? { filePath } : {}), // Only update filePath if it exists
        },
    });
    
    return NextResponse.json(updatedChapter, { status: 200 });
}

export const DELETE = async (req: NextRequest) => {
    const url   = new URL(req.url);
    const id = url.pathname.split('/').pop();
    const chapter = Number(id);
    // Get the existing chapter to check if it has a filePath

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

        // Delete the existing file if it exists
        if (existingChapter?.filePath) {
            const oldPath = path.join(process.cwd(), 'public', existingChapter.filePath);
            if (existsSync(oldPath)) {
                unlinkSync(oldPath);
            }
        }

        await prisma.chapter.delete({
            where: {
                id: chapter,
            },
        });
        return NextResponse.json(chapter, { status: 200 });
}