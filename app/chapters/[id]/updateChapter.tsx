"use client";
import { SyntheticEvent, useState } from 'react';
import type { Document } from '@prisma/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Chapter = {
    name: string;
    id: number;
    filePath: string;
    documentId: number;
};

const UpdateChapter = ({documents, chapter} : {documents: Document[]; chapter: Chapter}) => {
    const [chapterName, setChapterName] = useState(chapter.name);
    const [filePath, setFilePath] = useState<File | null>(null);
    const [document, setDocument] = useState(chapter.documentId);
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();

    const handleUpdate = async (e: SyntheticEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', chapterName);
        formData.append('documentId', String(document));
        if (filePath instanceof File) {
            formData.append('file', filePath);
        }
        await axios.patch(`/api/chapters/${chapter.id}`, formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        router.refresh();
        setIsOpen(false);
        alert('Chapter updated successfully');
        

        // await axios.patch(`/api/chapters/${chapter.id}`, {
        //     name: chapterName,
        //     filePath: filePath,
        //     documentId: Number(document)
        // });
        
        // router.refresh();
        // setIsOpen(false);
        // alert('Chapter added successfully');
    }

    const openModal = () => {
        setIsOpen(!isOpen);
    };

    return (
    <div>
        <button className="btn btn-info btn-sm" onClick={openModal}>EDIT</button>
        <div className={isOpen ? "modal modal-open" : "modal"}> 
            <div className="modal-box">
                <h3 className="font-bold text-lg pb-5">Edit {chapter.name}</h3>
                <form onSubmit={handleUpdate}>
                    <div className="form-control w-full max-w-xs pb-2">
                        <label className="label font-bold text-black">
                            Chapter Name
                        </label>
                        <input type="text" value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="Chapter Name" className="input input-bordered w-full max-w-xs" />
                    </div>
                    <div className="form-control w-full max-w-xs pb-2">
                        <label className="label font-bold text-black">
                            File
                        </label>
                        <input type="file" accept='application/pdf' onChange={(e) => setFilePath(e.target.files?.[0] || null)} />
                        <span className="text-sm text-gray-500 mt-1 italic">Current: {chapter.filePath.split('/').pop()}</span>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label font-bold text-black">
                            Document Type
                        </label>
                        <select value={document} onChange={(e) => setDocument(Number(e.target.value))} className="select select-bordered w-full max-w-xs">
                            {documents.map((doc) => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={openModal}>Close</button>
                        <button type="submit" className="btn btn-primary">Update</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    )
}
export default UpdateChapter;