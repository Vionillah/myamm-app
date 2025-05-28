import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path'; // Masih berguna untuk mengekstrak nama file dari URL
import { supabase } from '@/lib/supabase'; // Import Supabase client yang sudah kita buat

const prisma = new PrismaClient();
const BUCKET_NAME = 'uploads'; // Pastikan ini sesuai dengan nama bucket Anda di Supabase

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const file = formData.get('file') as File; // Ini akan menjadi File object dari input type="file"
    const documentId = Number(formData.get('documentId'));

    if (!name || isNaN(documentId)) { // Perbaikan validasi documentId
      return NextResponse.json({ error: 'Missing fields or invalid documentId' }, { status: 400 });
    }

    let fileUrl: string | undefined = undefined; // Ini akan menyimpan URL publik dari Supabase Storage

    // Cek apakah ada file baru yang diunggah
    if (file && file.size > 0) {
      // 1. Dapatkan informasi file lama dari database
      const existingChapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { filePath: true },
      });

      // 2. Hapus file lama dari Supabase Storage jika ada dan itu adalah URL Supabase
      if (existingChapter?.filePath && existingChapter.filePath.startsWith(`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]}/storage/v1/object/public/${BUCKET_NAME}/`)) {
        const oldFilePath = existingChapter.filePath;
        // Kita perlu mendapatkan path relatif file di dalam bucket
        // Contoh: dari "https://<proj_ref>.supabase.co/storage/v1/object/public/documents/uploads/old_file.pdf"
        // menjadi "uploads/old_file.pdf"
        const oldFileSubPath = oldFilePath.split(`${BUCKET_NAME}/`)[1]; 
        
        console.log(`Attempting to delete old file from Supabase Storage: ${oldFileSubPath}`);
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([oldFileSubPath]);

        if (deleteError) {
          console.error(`Failed to delete old file ${oldFileSubPath} from Supabase Storage:`, deleteError);
          // Anda bisa memutuskan untuk melanjutkan atau menghentikan proses di sini
          // Jika tidak fatal, bisa log saja dan lanjut.
        } else {
          console.log(`Old file deleted from Supabase Storage: ${oldFileSubPath}`);
        }
      }

      // 3. Upload file baru ke Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Buat nama unik dan aman
      const filePathInBucket = `uploads/${fileName}`; // Path dalam bucket, Anda bisa sesuaikan

      console.log(`Attempting to upload new file to Supabase Storage: ${filePathInBucket}`);
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePathInBucket, file, {
          cacheControl: '3600', // Cache file selama 1 jam
          upsert: true, // Akan menimpa jika nama file sama (opsional, sesuaikan kebutuhan)
        });

      if (uploadError) {
        console.error('Error uploading file to Supabase Storage:', uploadError);
        return NextResponse.json({ error: 'Failed to upload new file' }, { status: 500 });
      }

      // 4. Dapatkan URL publik dari file yang baru diunggah
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePathInBucket);

      if (!publicUrlData) {
        console.error('Failed to get public URL for uploaded file.');
        return NextResponse.json({ error: 'Failed to get file URL after upload' }, { status: 500 });
      }
      fileUrl = publicUrlData.publicUrl;
      console.log('File uploaded to Supabase Storage, URL:', fileUrl);
    }

    // 5. Update data chapter di database dengan URL file baru
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        name,
        documentId,
        ...(fileUrl ? { filePath: fileUrl } : {}), // Update filePath hanya jika file baru diunggah
      },
    });

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    // Pertimbangkan untuk tidak memanggil $disconnect() di setiap request
    // karena Prisma merekomendasikan satu instance untuk seluruh siklus hidup aplikasi serverless.
    // Tetapi jika Anda ingin memutus, lakukan hanya di production.
    // if (process.env.NODE_ENV === 'production') {
    //   await prisma.$disconnect();
    // }
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // 1. Dapatkan filePath dari chapter yang akan dihapus
    const existingChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { filePath: true },
    });

    // 2. Hapus file terkait dari Supabase Storage jika itu adalah URL Supabase
    if (existingChapter?.filePath && existingChapter.filePath.startsWith(`https://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]}/storage/v1/object/public/${BUCKET_NAME}/`)) {
        const oldFilePath = existingChapter.filePath;
        const oldFileSubPath = oldFilePath.split(`${BUCKET_NAME}/`)[1]; 

        console.log(`Attempting to delete file from Supabase Storage during DELETE: ${oldFileSubPath}`);
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([oldFileSubPath]);

        if (deleteError) {
          console.error(`Failed to delete file ${oldFileSubPath} from Supabase Storage during DELETE:`, deleteError);
          // Lanjutkan proses meskipun gagal menghapus file, agar chapter tetap bisa dihapus
        } else {
          console.log(`File deleted from Supabase Storage during DELETE: ${oldFileSubPath}`);
        }
    }

    // 3. Hapus chapter dari database
    await prisma.chapter.delete({
      where: { id: chapterId },
    });
    return NextResponse.json({ message: `Chapter with ID ${id} deleted successfully` }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE handler:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    // if (process.env.NODE_ENV === 'production') {
    //   await prisma.$disconnect();
    // }
  }
};