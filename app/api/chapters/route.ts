import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';
// import type { Chapter } from '@prisma/client';

const prisma = new PrismaClient();

export const POST = async (request: Request) => {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const file = formData.get('file') as File; 
    const documentId = Number(formData.get('documentId'));

    if (!file || !name || !documentId) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filePath = `uploads/${filename}`;
    const fullPath = path.join(process.cwd(), 'public', filePath);
    
    await writeFile(fullPath, buffer);

    const chapter = await prisma.chapter.create({
        data: {
            name,
            filePath, // Store the relative path to the file
            documentId,
        },
    });
    // const body:Chapter = await request.json();

    // const chapter = await prisma.chapter.create({
    //     data: {
    //         name: body.name,
    //         documentId: body.documentId,
    //         filePath: body.filePath, // Make sure filePath is provided in the request body
    //     },
    // });
    return NextResponse.json(chapter, { status: 201 });
}