import React from 'react';

export const Header: React.FC = () => (
    <header className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl text-center mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 pb-2">
            🎓 Generator Soal Otomatis
        </h1>
        <p className="text-slate-400 mt-2 text-base sm:text-lg">
            Sistem pembuat soal lengkap dengan kisi-kisi, kunci jawaban, dan analisis butir soal
        </p>
    </header>
);