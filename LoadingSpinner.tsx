import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800/70 backdrop-blur-sm rounded-2xl shadow-xl">
        <svg className="animate-spin h-10 w-10 text-sky-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-xl font-semibold text-slate-200">Sedang membuat paket soal...</h3>
        <p className="text-slate-400 mt-1">AI sedang bekerja, mohon tunggu sebentar.</p>
    </div>
);