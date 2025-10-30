import React from 'react';

interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => (
    <div className="bg-red-900/50 border-l-4 border-red-500 text-red-300 p-6 rounded-r-lg shadow-md" role="alert">
        <p className="font-bold text-lg text-red-200">Terjadi Kesalahan</p>
        <p>{message}</p>
    </div>
);