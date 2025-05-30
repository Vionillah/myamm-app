// app/chapters/[id]/ChapterClient.tsx
'use client';

import { useMemo, useState } from 'react';
import AddChapter from './addChapter';
import DeleteChapter from './deleteChapter';
import UpdateChapter from './updateChapter';
import Link from 'next/link';
import { User } from '@supabase/supabase-js'; // Import User type

type Chapter = {
  id: number;
  name: string;
  filePath: string;
  documentId: number;
};

type Document = {
  id: number;
  name: string;
  alias: string | null;
};

// Menerima 'user' sebagai prop
export default function ChapterClient({ chapters, documents, session }: { chapters: Chapter[]; documents: Document[]; session: User | null }) {
  const [search, setSearch] = useState('');
  //State untuk sorting
  const [sortKey, setSortKey] = useState<'id' | 'name'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedChapters = useMemo(() => {
    //salinan array agar tidak memodifikasi array asli
    const sortableChapters = [...filteredChapters];

    sortableChapters.sort((a,b) => {
      let valA: string | number = a[sortKey];
      let valB: string | number = b[sortKey];

      //konversi lowercase untuk sorting string yg case-insensitive
      if (typeof valA === 'string') valA = valA.toLocaleLowerCase();
      if (typeof valB === 'string') valB = valB.toLocaleLowerCase();

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      return 0;
    });
    return sortableChapters;
  }, [filteredChapters, sortKey, sortOrder]);

  // Tentukan mode berdasarkan keberadaan objek user
  const isAdminMode = !!session; // true jika ada user (admin), false jika tidak ada (guest)

  const handleSortChange = (key: 'id' | 'name') => {
    if (sortKey === key){
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  }
  return (
    
    <div>
      <div className="mb-5 w-full flex">
        <div className="rounded-box grid grow place-items-start">
            <Link className='btn' href='/'>Back</Link>
        </div>
      </div>

      {isAdminMode ? (
        <div>
          <div className="mb-5 w-full flex flex-col sm:flex-row gap-4"> {/* Tambahkan gap */}
            <div className='card rounded-box grid grow place-items-start content-center'>
                <input
                    type="text"
                    placeholder="Search chapter..."
                    className="input input-bordered w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Kontrol Sortir untuk Admin */}
            <div className='card rounded-box grid grow place-items-start content-center'>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Sort by:</span>
                    <button
                        onClick={() => handleSortChange('name')}
                        className={`btn btn-sm ${sortKey === 'name' ? 'btn-active' : ''}`}
                    >
                        Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                    <button
                        onClick={() => handleSortChange('id')}
                        className={`btn btn-sm ${sortKey === 'id' ? 'btn-active' : ''}`}
                    >
                        ID {sortKey === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                </div>
            </div>
            <div className='card rounded-box grid grow place-items-end content-center'>
                <AddChapter documents={documents}/>
            </div>
          </div>
          <table className="table w-full">
            <thead>
              <tr>
                <td>
                    No
                    {/* Opsional: Tambahkan kontrol sortir di header tabel jika diinginkan */}
                </td>
                <td>
                    Nama Chapter
                    {/* Opsional: Tombol sortir di header kolom */}
                </td>
                <td className="text-center">Actions</td>
              </tr>
            </thead>
            <tbody>
              {sortedChapters.map((chapter, index) => ( // Gunakan sortedChapters
                <tr key={chapter.id}>
                  <td>{index + 1}</td>
                  <td>
                    <a
                      href={`${chapter.filePath}`}
                      target='_blank' rel='noopener noreferrer'
                      className='text-blue-950 hover:underline'>
                      {chapter.name}
                    </a>
                  </td>
                  <td className='flex justify-center space-x-1'>
                    <UpdateChapter documents={documents} chapter={chapter}/>
                    <DeleteChapter chapter={chapter}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : ( // Jika mode Guest (tidak ada user yang login)
        <div className='mb-5 w-full flex flex-col space-y-5'>
            <div className='card rounded-box grid grow place-items-start content-center'>
                <input
                    type="text"
                    placeholder="Search chapter..."
                    className="input input-bordered w-full max-w-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Kontrol Sortir untuk Guest */}
            <div className='card rounded-box grid grow place-items-start content-center'>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Sort by:</span>
                    <button
                        onClick={() => handleSortChange('name')}
                        className={`btn btn-sm ${sortKey === 'name' ? 'btn-active' : ''}`}
                    >
                        Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                    <button
                        onClick={() => handleSortChange('id')}
                        className={`btn btn-sm ${sortKey === 'id' ? 'btn-active' : ''}`}
                    >
                        ID {sortKey === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </button>
                </div>
            </div>
            <div className='ordered-list list-none'>
                <ol className='list-decimal list-outside pl-5'>
                    {sortedChapters.map((chapter) => ( // Gunakan sortedChapters
                    <li key={chapter.id} className='mb-2'>
                        <a href={`${chapter.filePath}`}
                        target='_blank' rel='noopener noreferrer'
                        className='text-blue-950 hover:underline'>
                        {chapter.name}
                        </a>
                    </li>
                    ))}
                </ol>
            </div>
        </div>
      )}
    </div>
  );
}