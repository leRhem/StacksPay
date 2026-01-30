import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1A1A1A] w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Icons.X />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
