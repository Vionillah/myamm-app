'use client';
import 'app/globals.css';

import { useState } from 'react';
import AddChapter from "./addChapter";
import DeleteChapter from './deleteChapter';
import UpdateChapter from './updateChapter';
import Link from 'next/link';

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

export default function ChapterClient ({chapters, documents}: {chapters: Chapter[]; documents: Document[]}) {
  const [search, setSearch] = useState('');
  const filteredChapters = chapters.filter(chapter =>
    chapter.name.toLowerCase().includes(search.toLowerCase())
  );
  const [isChecked, setIsChecked] = useState(true);

  return (
    <div>
        <div className="mb-5 w-full flex">
            <div className="rounded-box grid grow place-items-start">
                <Link className='btn' href='/'>Back</Link>
            </div>
            <div className='rounded-box grid grow place-items-end content-center'>
                <label className='label'>
                    User Mode                    
                    <input type="checkbox" checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)} className="toggle toggle-md"/>
                </label>
            </div> 
        </div>
        { isChecked ? (
            <div className='mb-5 w-full flex flex-col space-y-5'>
                <div className='card rounded-box grid grow place-items-start content-center'>
                    <input type="text" placeholder="Search chapter..."
                    className="input input-bordered w-full max-w-xs"
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className='ordered-list list-none'>
                    <ol className='list-decimal list-outside pl-5'>
                        {filteredChapters.map((chapter) => (
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
        ) : (
            <div>
                <div className="mb-5 w-full flex">
                    <div className='card rounded-box grid grow place-items-start content-center'>
                        <input
                            type="text"
                            placeholder="Search chapter..."
                            className="input input-bordered w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className='card rounded-box grid grow place-items-end content-center'><AddChapter documents={documents}/></div> 
                </div>
                <table className="table w-full">
                <thead>
                <tr>
                    <td>No</td>
                    <td>Nama Chapter</td>
                    <td className="text-center">Actions</td>
                </tr>
                </thead>
                <tbody>
                {filteredChapters.map((chapter, index) => (
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
        )}
        
    </div>
  );
};