import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { supabase } from '@/lib/supabase'; // Import Supabase client

const prisma = new PrismaClient();
const BUCKET_NAME = 'uploads'; // Pastikan ini sesuai dengan nama bucket Anda di Supabase

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    const documentId = Number(formData.get('documentId'));

    if (!file || !name || isNaN(documentId)) { // Perbaikan validasi documentId
      return NextResponse.json({ error: 'Missing fields or invalid documentId' }, { status: 400 });
    }

    let fileUrl: string | undefined = undefined;

    // Upload file ke Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Buat nama unik dan aman
    const filePathInBucket = `uploads/${fileName}`; // Path dalam bucket

    console.log(`Attempting to upload new file to Supabase Storage: ${filePathInBucket}`);
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePathInBucket, file, {
        cacheControl: '3600',
        upsert: false, // Untuk POST, biasanya kita tidak ingin menimpa
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase Storage:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Dapatkan URL publik dari file yang diunggah
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePathInBucket);

    if (!publicUrlData) {
      console.error('Failed to get public URL for uploaded file.');
      return NextResponse.json({ error: 'Failed to get file URL after upload' }, { status: 500 });
    }
    fileUrl = publicUrlData.publicUrl;
    console.log('File uploaded to Supabase Storage, URL:', fileUrl);

    // Buat chapter baru di database dengan URL file dari Supabase Storage
    const chapter = await prisma.chapter.create({
      data: {
        name,
        filePath: fileUrl, // Simpan URL publik di sini
        documentId,
      },
    });

    return NextResponse.json(chapter, { status: 201 });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    // if (process.env.NODE_ENV === 'production') {
    //   await prisma.$disconnect();
    // }
  }
};