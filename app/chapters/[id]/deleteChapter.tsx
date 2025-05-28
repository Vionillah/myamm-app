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

    const router = useRouter();

    const handleDelete = async (chapterId: number) => {
        await axios.delete(`/api/chapters/${chapterId}`)
        router.refresh();
        setIsOpen(false);        
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
                    <button type="submit" onClick={()=>handleDelete(chapter.id)} className="btn btn-primary">Yes</button>
                </div>
            </div>
        </div>
    </div>
    )
}
export default DeleteChapter;