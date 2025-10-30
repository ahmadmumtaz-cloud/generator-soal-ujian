import React from 'react';

interface ExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string | null;
}

export const ExplanationModal: React.FC<ExplanationModalProps> = ({ isOpen, onClose, content }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-sky-400">💡 Penjelasan dari AI</h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"
                        aria-label="Tutup modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-200 whitespace-pre-wrap">
                        {content ? <p>{content}</p> : <p>Memuat penjelasan...</p>}
                    </div>
                </main>
            </div>
        </div>
    );
};
