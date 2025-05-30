"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Chapter = {
    name: string;
    id: number;
    filePath: string;
    documentId: number;
}

const DeleteChapter = ({chapter} : {chapter: Chapter}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false); // State untuk loadin
    const router = useRouter();

    const handleDelete = async (chapterId: number) => {
        setLoading(true);
        try {
            await axios.delete(`/api/chapters/${chapterId}`)
            console.log('Chapter deleted successfully')
            setIsOpen(false);        
            router.refresh();
            alert('Chapter deleted successfully')
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('Failed to delete chapter: ' + (axios.isAxiosError(error) ? error.response?.data?.message || error.message : ''));
        } finally {
            setLoading(false);
        }
    }

    const openModal = () => {
        setIsOpen(!isOpen);
    };

    return (
    <div>
        <button className="btn btn-error btn-sm" onClick={openModal}>DELETE</button>
        <div className={isOpen ? "modal modal-open" : "modal"}> 
            <div className="modal-box">
                <h3 className="font-bold text-lg">Are you sure to delete {chapter.name}?</h3>
                <div className="modal-action">
                    <button type="button" className="btn" onClick={openModal}>No</button>
                    <button type="submit" onClick={()=>handleDelete(chapter.id)} className={`btn btn-error ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
                        {loading ? (
                            <>
                            <span className="loading loading-spinner"></span>
                            Deleting...
                            </>
                        ) : (
                            'Yes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
    )
}
export default DeleteChapter;