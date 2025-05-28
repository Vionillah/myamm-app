import { unlinkSync, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
// import type { Chapter } from '@prisma/client';

const prisma = new PrismaClient();

export const PATCH = async (request: Request, {params}: {params: {id: string}}) => {
    const formData = await request.formData();
    
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
                id: Number(params.id),
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
    
    const chapter = await prisma.chapter.update({
        where: {
            id: Number(params.id),
        },
        data: {
            name,
            documentId,
            ...(filePath ? { filePath } : {}), // Only update filePath if it exists
        },
    });
    // const body: Chapter = await request.json();
    // const chapter = await prisma.chapter.update({
    //     where:{
    //         id: Number(params.id)
    //     },
    //     data: {
    //         name: body.name,
    //         filePath: body.filePath, // Ensure filePath is provided in the request body
    //         documentId: body.documentId // Ensure documentId is provided in the request body
    //     }
    // });
    return NextResponse.json(chapter, { status: 200 });
}

export const DELETE = async (_req: Request, {params}: {params: {id: string}}) => {
    const chapter = Number(params.id);
    // Get the existing chapter to check if it has a filePath

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