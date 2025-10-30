import React from 'react';
import type { GeneratedPackage, SoalItem, ActionFeedback, EditableItemType, EditableItemData } from '../types';
import { exportToPDF, exportToDOCX, exportToPlainText } from '../services/exportService';
import { MathRenderer } from './MathRenderer';

interface ResultsDisplayProps {
    generatedPackage: GeneratedPackage;
    onRegenerate: (questionNumber: number) => void;
    onExplain: (questionNumber: number) => void;
    onEdit: (itemType: EditableItemType, itemData: EditableItemData) => void;
    onDelete: (questionNumber: number) => void;
    onAdd: (itemType: EditableItemType) => void;
    processingQuestionId: number | null;
    actionFeedback: ActionFeedback | null;
}

const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
    <h3 className="text-2xl font-bold text-slate-200 mt-8 mb-4 pb-2 border-b-2 border-sky-500 flex items-center">
        <span className="mr-3 text-2xl">{icon}</span>
        {title}
    </h3>
);

const DifficultyBadge: React.FC<{ difficulty: 'Mudah' | 'Sedang' | 'Sukar' }> = ({ difficulty }) => {
    const styles = {
        'Mudah': 'bg-green-900/70 text-green-300',
        'Sedang': 'bg-yellow-900/70 text-yellow-300',
        'Sukar': 'bg-red-900/70 text-red-300',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[difficulty]}`}>
            {difficulty}
        </span>
    );
};

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; tooltip: string, className?: string }> = ({ onClick, disabled, children, tooltip, className = '' }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-1.5 rounded-full text-slate-400 hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait ${className}`}
        >
            {children}
        </button>
         <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            {tooltip}
        </span>
    </div>
);

const MiniSpinner: React.FC = () => (
     <svg className="animate-spin h-5 w-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
);


const QuestionItem: React.FC<{ 
    item: SoalItem; 
    onRegenerate: (nomor: number) => void;
    onExplain: (nomor: number) => void;
    onEdit: (itemType: 'soal', itemData: SoalItem) => void;
    onDelete: (nomor: number) => void;
    isProcessing: boolean;
    actionFeedback: ActionFeedback | null;
}> = ({ item, onRegenerate, onExplain, onEdit, onDelete, isProcessing, actionFeedback }) => (
    <div className="bg-slate-900/60 rounded-lg p-5 mb-4 border-l-4 border-sky-500 shadow-sm relative group">
        <div className="flex justify-between items-start mb-2">
            <div className="flex-grow">
                <p className="font-bold text-sky-400 mb-1">Soal Nomor {item.nomor}</p>
                <DifficultyBadge difficulty={item.tingkatKesukaran} />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
                 {actionFeedback && actionFeedback.questionId === item.nomor && !isProcessing && (
                    <div className={`text-xs font-semibold transition-opacity duration-300 animate-fade-in ${
                        actionFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {actionFeedback.message}
                    </div>
                )}
                {isProcessing ? <MiniSpinner /> : (
                    <>
                        {/* CRUD Buttons */}
                        <ActionButton onClick={() => onEdit('soal', item)} disabled={isProcessing} tooltip="Edit Soal" className="hover:text-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                        </ActionButton>
                        <ActionButton onClick={() => onDelete(item.nomor)} disabled={isProcessing} tooltip="Hapus Soal" className="hover:text-red-400">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </ActionButton>
                        <div className="border-l border-slate-600 h-5 mx-1"></div>
                        {/* AI Buttons */}
                        <ActionButton onClick={() => onRegenerate(item.nomor)} disabled={isProcessing} tooltip="Regenerate Soal" className="hover:text-sky-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15M20 20l-1.5-1.5A9 9 0 003.5 9" /></svg>
                        </ActionButton>
                        <ActionButton onClick={() => onExplain(item.nomor)} disabled={isProcessing} tooltip="Jelaskan Jawaban" className="hover:text-sky-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </ActionButton>
                    </>
                )}
            </div>
        </div>
        {item.deskripsiGambar && (
             <div className="my-3 p-3 bg-gray-700/50 border border-dashed border-gray-500 rounded-lg text-slate-400 italic">
                <span className="font-bold text-slate-300">🖼️ Deskripsi Gambar:</span> {item.deskripsiGambar}
             </div>
        )}
        <div className="text-slate-300 leading-relaxed"><MathRenderer text={item.pertanyaan} /></div>
        {item.tipeSoal === 'Pilihan Ganda' && item.pilihan && (
            <div className="mt-4 space-y-2">
                {item.pilihan.map((opt, index) => (
                    <div key={index} className="text-slate-300"><MathRenderer text={opt} /></div>
                ))}
            </div>
        )}
    </div>
);


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ generatedPackage, onRegenerate, onExplain, onEdit, onDelete, onAdd, processingQuestionId, actionFeedback }) => {
    const { meta, kisiKisi, soal, kunciJawaban, analisisButirSoal } = generatedPackage;

    const handleExport = (format: 'pdf' | 'docx' | 'txt') => {
        switch (format) {
            case 'pdf':
                exportToPDF(generatedPackage);
                break;
            case 'docx':
                exportToDOCX(generatedPackage);
                break;
            case 'txt':
                exportToPlainText(generatedPackage);
                break;
        }
    };
    
    const ExportButton: React.FC<{ format: 'pdf' | 'docx' | 'txt', icon: string, text: string }> = ({ format, icon, text }) => (
        <button
            onClick={() => handleExport(format)}
            className="flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-slate-200 font-semibold py-2 px-5 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-200 ease-in-out border border-slate-600"
        >
            <span className="mr-2 text-lg">{icon}</span>
            {text}
        </button>
    );
    
    const AddItemButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
        <button onClick={onClick} className="w-full mt-4 text-sm bg-sky-800/50 hover:bg-sky-700/60 text-sky-300 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Tambah Item Baru
        </button>
    );

    return (
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl animate-fade-in">
            <header className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-200">📋 Paket Soal {meta.subject} Kelas {meta.grade}</h2>
                <p className="text-slate-400 mt-2">
                    Topik: {meta.topic} | Jenis: {meta.questionType} | Jumlah: {meta.questionCount} soal
                </p>
            </header>
            
            <div className="flex flex-wrap gap-4 justify-center my-6 pb-6 border-b border-slate-700">
                <ExportButton format="pdf" icon="📄" text="Export PDF" />
                <ExportButton format="docx" icon="✍️" text="Export DOCX" />
                <ExportButton format="txt" icon="📜" text="Export Teks" />
            </div>

            {/* Kisi-Kisi Soal */}
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <SectionTitle icon="📊" title="Kisi-Kisi Soal" />
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="w-full text-sm text-left text-slate-300 bg-slate-800">
                        <thead className="text-xs text-white uppercase bg-gradient-to-r from-sky-600 to-cyan-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">No</th>
                                <th scope="col" className="px-6 py-3">Kompetensi Dasar</th>
                                <th scope="col" className="px-6 py-3">Indikator</th>
                                <th scope="col" className="px-6 py-3">Level Kognitif</th>
                                <th scope="col" className="px-6 py-3">Bentuk Soal</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kisiKisi.map((item) => (
                                <tr key={item.nomor} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-slate-100">{item.nomor}</td>
                                    <td className="px-6 py-4">{item.kompetensiDasar}</td>
                                    <td className="px-6 py-4">{item.indikator}</td>
                                    <td className="px-6 py-4">{item.levelKognitif}</td>
                                    <td className="px-6 py-4">{item.bentukSoal}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <ActionButton onClick={() => onEdit('kisiKisi', item)} disabled={false} tooltip="Edit" className="hover:text-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></ActionButton>
                                            <ActionButton onClick={() => onDelete(item.nomor)} disabled={false} tooltip="Hapus" className="hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></ActionButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <AddItemButton onClick={() => onAdd('kisiKisi')} />
            </section>

            {/* Soal */}
            <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <SectionTitle icon="📝" title="Soal" />
                {soal.map((item) => <QuestionItem 
                    key={item.nomor} 
                    item={item} 
                    onRegenerate={onRegenerate}
                    onExplain={onExplain}
                    onEdit={onEdit as any} // Cast because this is specific to SoalItem
                    onDelete={onDelete}
                    isProcessing={processingQuestionId === item.nomor}
                    actionFeedback={actionFeedback}
                />)}
                <AddItemButton onClick={() => onAdd('soal')} />
            </section>

            {/* Kunci Jawaban */}
            <section className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <SectionTitle icon="🔑" title="Kunci Jawaban" />
                 <div className="bg-slate-900/70 p-5 rounded-lg space-y-2">
                    {kunciJawaban.map(item => (
                         <div key={item.nomor} className="flex justify-between items-center group">
                             <p className="text-slate-300">
                                <span className="font-bold text-sky-400">{item.nomor}.</span> {item.jawaban}
                             </p>
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                                <ActionButton onClick={() => onEdit('kunciJawaban', item)} disabled={false} tooltip="Edit" className="hover:text-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></ActionButton>
                                <ActionButton onClick={() => onDelete(item.nomor)} disabled={false} tooltip="Hapus" className="hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></ActionButton>
                             </div>
                         </div>
                    ))}
                </div>
                 <AddItemButton onClick={() => onAdd('kunciJawaban')} />
            </section>

            {/* Analisis Butir Soal */}
            <section className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                <SectionTitle icon="📈" title="Analisis Butir Soal" />
                <div className="overflow-x-auto rounded-lg shadow-md">
                    <table className="w-full text-sm text-left text-slate-300 bg-slate-800">
                        <thead className="text-xs text-white uppercase bg-gradient-to-r from-sky-600 to-cyan-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">No Soal</th>
                                <th scope="col" className="px-6 py-3">Tingkat Kesukaran</th>
                                <th scope="col" className="px-6 py-3">Daya Pembeda</th>
                                <th scope="col" className="px-6 py-3">Efektivitas Pengecoh</th>
                                <th scope="col" className="px-6 py-3">Validitas</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analisisButirSoal.map((item) => (
                                <tr key={item.nomor} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-slate-100">{item.nomor}</td>
                                    <td className="px-6 py-4">{item.tingkatKesukaran}</td>
                                    <td className="px-6 py-4">{item.dayaPembeda}</td>
                                    <td className="px-6 py-4">{item.efektivitasPengecoh}</td>
                                    <td className="px-6 py-4">{item.validitas}</td>
                                    <td className="px-6 py-4">
                                         <div className="flex items-center space-x-2">
                                            <ActionButton onClick={() => onEdit('analisisButirSoal', item)} disabled={false} tooltip="Edit" className="hover:text-yellow-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></ActionButton>
                                            <ActionButton onClick={() => onDelete(item.nomor)} disabled={false} tooltip="Hapus" className="hover:text-red-400"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></ActionButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <AddItemButton onClick={() => onAdd('analisisButirSoal')} />
            </section>
            
            <footer className="text-center mt-10 pt-6 border-t border-slate-700">
                <p className="text-sm text-slate-500">
                    Paket Soal Dihasilkan oleh AI Gemini
                </p>
            </footer>
        </div>
    );
};