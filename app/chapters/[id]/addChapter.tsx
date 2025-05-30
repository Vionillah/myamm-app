"use client";
import { SyntheticEvent, useState } from 'react';
import type { Document } from '@prisma/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AddChapter = ({documents} : {documents: Document[]}) => {
    const [chapterName, setChapterName] = useState('');
    const [filePath, setFilePath] = useState<File| null>(null);
    const [document, setDocument] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFilePath(e.target.files[0]);
        }
    }

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setLoading(true);
        
        if (!chapterName || !filePath || !document) {
            alert('Please fill all fields');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', chapterName);
        formData.append('file', filePath);
        formData.append('documentId', document);

        try {
            await axios.post('/api/chapters', formData);
            setChapterName('');
            setFilePath(null);
            setDocument('');
            router.refresh();
            setIsOpen(false);
            alert('Chapter added successfully');
        } catch (error) {
            console.error('Error adding chapter:', error);
            alert('Failed to add chapter');
            return;
        } finally {
            setLoading(false);
        }
    }

    const openModal = () => {
        setIsOpen(!isOpen);
         if (!isOpen) {
            setChapterName('');
            setFilePath(null);
            setDocument('');
        }
    };

    return (
    <div>
        <button className="btn btn-primary" onClick={openModal}>Add New</button>
        <div className={isOpen ? "modal modal-open" : "modal"}> 
            <div className="modal-box">
                <h3 className="font-bold text-lg pb-5">Add Chapter</h3>
                <form onSubmit={handleSubmit} encType='multipart/form-data'>
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
                        <input type="file" accept='application/pdf' onChange={handleFileChange} className="file-input file-input-bordered w-full"/>
                    </div>
                    <div className="form-control w-full max-w-xs">
                        <label className="label font-bold text-black">
                            Document Type
                        </label>
                        <select value={document} onChange={(e) => setDocument(e.target.value)} className="select select-bordered w-full max-w-xs">
                            <option value="" disabled>Select Document Type</option>
                            {documents.map((doc) => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={openModal}>Close</button>
                        <button type="submit" className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}> {/* <--- Tambahkan kelas dan disabled */}
                            {loading ? ( // <--- Conditional rendering untuk loading spinner
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    )
}
export default AddChapter;