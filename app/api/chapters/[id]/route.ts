// app/api/chapters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin'; // Import the admin client

const BUCKET_NAME = 'uploads'; // Pastikan ini sesuai dengan nama bucket Anda di Supabase

export const PATCH = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createAdminClient(); // Menggunakan admin client
  try {
    const { id } = params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID provided' }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const file = formData.get('file') as File | null; // Gunakan 'File | null' karena mungkin tidak ada file baru
    const documentId = Number(formData.get('documentId'));

    // Validasi input dasar
    if (!name || isNaN(documentId)) {
      return NextResponse.json({ error: 'Missing required fields (name, documentId) or invalid documentId' }, { status: 400 });
    }

    let fileUrl: string | undefined = undefined; // Akan menyimpan URL publik dari Supabase Storage

    // Cek apakah ada file baru yang diunggah dan memiliki ukuran > 0
    if (file && file.size > 0) {
      // Dapatkan filePath lama dari chapter yang ada
      const existingChapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        select: { filePath: true },
      });

      // Periksa apakah URL Supabase sudah ada dan valid sebelum mencoba menghapus
      if (existingChapter?.filePath) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        // Pastikan supabaseUrl didefinisikan sebelum digunakan
        if (!supabaseUrl) {
            console.error('Server configuration error: NEXT_PUBLIC_SUPABASE_URL is missing.');
            return NextResponse.json({ error: 'Server configuration error: Supabase URL missing.' }, { status: 500 });
        }

        const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;

        if (existingChapter.filePath.startsWith(expectedPrefix)) {
          const oldFileSubPath = existingChapter.filePath.substring(expectedPrefix.length);

          if (oldFileSubPath) {
            const { error: deleteError } = await supabase.storage
              .from(BUCKET_NAME)
              .remove([oldFileSubPath]);

            if (deleteError) {
              // Log error penghapusan file di server (penting untuk produksi)
              console.error(`Failed to delete old file ${oldFileSubPath} from Supabase Storage:`, deleteError);
              // Tidak mengembalikan error di sini agar proses upload file baru bisa dilanjutkan
            }
          }
        }
      }

      // Upload file baru ke Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Nama unik dan aman
      const filePathInBucket = fileName; // Path dalam bucket, Anda bisa sesuaikan jika ada subfolder

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePathInBucket, file, {
          cacheControl: '3600', // Cache file selama 1 jam
          upsert: true, // Akan menimpa jika nama file sama
        });

      if (uploadError) {
        console.error('Error uploading new file to Supabase Storage:', uploadError);
        return NextResponse.json({ error: 'Failed to upload new file' }, { status: 500 });
      }

      // Dapatkan URL publik dari file yang baru diunggah
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePathInBucket);

      if (!publicUrlData) {
        console.error('Failed to get public URL for uploaded file after successful upload.');
        return NextResponse.json({ error: 'Failed to get file URL after upload' }, { status: 500 });
      }
      fileUrl = publicUrlData.publicUrl;
    }

    // Update data chapter di database dengan URL file baru (jika ada)
    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        name,
        documentId,
        ...(fileUrl ? { filePath: fileUrl } : {}), // Hanya update filePath jika file baru diunggah
      },
    });

    return NextResponse.json(updatedChapter, { status: 200 });
  } catch (error) {
    console.error('Error in PATCH handler:', error); // Log error umum
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
  // Tidak ada finally block yang diperlukan di sini
};


export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const supabase = createAdminClient(); // Menggunakan admin client

  try {
    const { id } = params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: 'Invalid chapter ID provided' }, { status: 400 });
    }

    // Dapatkan filePath dari chapter yang akan dihapus
    const existingChapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { filePath: true },
    });

    if (!existingChapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    const fileUrl = existingChapter.filePath;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // Pastikan supabaseUrl didefinisikan sebelum digunakan
    if (!supabaseUrl) {
      console.error('Server configuration error: NEXT_PUBLIC_SUPABASE_URL is missing.');
      return NextResponse.json({ error: 'Server configuration error: Supabase URL missing.' }, { status: 500 });
    }

    const expectedPrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;

    // Hapus file terkait dari Supabase Storage jika itu adalah URL Supabase yang valid
    if (fileUrl && fileUrl.startsWith(expectedPrefix)) {
      const oldFileSubPath = fileUrl.substring(expectedPrefix.length);

      if (oldFileSubPath) {
        const { error: deleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([oldFileSubPath]);

        if (deleteError) {
          // Log error penghapusan file di server (penting untuk produksi)
          console.error(`Failed to delete file ${oldFileSubPath} from Supabase Storage:`, deleteError);
          // Saat ini, log error dan lanjutkan penghapusan DB.
        }
      }
    }

    // Hapus chapter dari database
    await prisma.chapter.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ message: `Chapter with ID ${id} deleted successfully` }, { status: 200 });

  } catch (error) {
    console.error('Error in DELETE handler:', error); // Tetap log error umum
    if (error instanceof Error) {
      return NextResponse.json({ message: 'Internal Server Error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
};
