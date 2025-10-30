import React, { useState, useEffect } from 'react';
import type { EditModalState, EditableItemType, EditableItemData, SoalItem, KisiKisiItem, KunciJawabanItem, AnalisisItem } from '../types';

interface EditModalProps {
    state: EditModalState;
    onClose: () => void;
    onSave: (itemType: EditableItemType, itemData: EditableItemData) => void;
}

const inputClasses = "w-full p-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out bg-slate-700/50 text-white placeholder-slate-400";
const labelClasses = "block text-sm font-medium text-slate-300 mb-1";


const EditModalForm: React.FC<{ itemType: EditableItemType, itemData: EditableItemData, setItemData: React.Dispatch<React.SetStateAction<EditableItemData | null>> }> = ({ itemType, itemData, setItemData }) => {
    
    const handleChange = (field: string, value: any) => {
        setItemData(prev => (prev ? { ...prev, [field]: value } : null));
    };

    const handlePilihanChange = (index: number, value: string) => {
        setItemData(prev => {
            if (!prev || !('pilihan' in prev) || !prev.pilihan) return prev;
            const newPilihan = [...prev.pilihan];
            newPilihan[index] = value;
            return { ...prev, pilihan: newPilihan };
        });
    };

    switch (itemType) {
        case 'soal':
            const soal = itemData as SoalItem;
            return (
                <div className="space-y-4">
                    <div>
                        <label htmlFor="pertanyaan" className={labelClasses}>Pertanyaan</label>
                        <textarea id="pertanyaan" value={soal.pertanyaan} onChange={e => handleChange('pertanyaan', e.target.value)} rows={4} className={inputClasses} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tingkatKesukaran" className={labelClasses}>Tingkat Kesukaran</label>
                            <select id="tingkatKesukaran" value={soal.tingkatKesukaran} onChange={e => handleChange('tingkatKesukaran', e.target.value)} className={inputClasses}>
                                <option>Mudah</option>
                                <option>Sedang</option>
                                <option>Sukar</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="tipeSoal" className={labelClasses}>Tipe Soal</label>
                            <select id="tipeSoal" value={soal.tipeSoal} onChange={e => handleChange('tipeSoal', e.target.value)} className={inputClasses}>
                                <option>Pilihan Ganda</option>
                                <option>Isian Singkat</option>
                                <option>Uraian</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="deskripsiGambar" className={labelClasses}>Deskripsi Gambar (Opsional)</label>
                        <input type="text" id="deskripsiGambar" value={soal.deskripsiGambar || ''} onChange={e => handleChange('deskripsiGambar', e.target.value)} className={inputClasses} />
                    </div>
                    {soal.tipeSoal === 'Pilihan Ganda' && (
                        <div>
                            <label className={labelClasses}>Pilihan Jawaban</label>
                            <div className="space-y-2">
                                {soal.pilihan?.map((p, index) => (
                                    <input key={index} type="text" value={p} onChange={e => handlePilihanChange(index, e.target.value)} className={inputClasses} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        case 'kisiKisi':
             const kisi = itemData as KisiKisiItem;
            return (
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="kompetensiDasar" className={labelClasses}>Kompetensi Dasar</label>
                        <input type="text" id="kompetensiDasar" value={kisi.kompetensiDasar} onChange={e => handleChange('kompetensiDasar', e.target.value)} className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="indikator" className={labelClasses}>Indikator</label>
                        <input type="text" id="indikator" value={kisi.indikator} onChange={e => handleChange('indikator', e.target.value)} className={inputClasses} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="levelKognitif" className={labelClasses}>Level Kognitif</label>
                            <input type="text" id="levelKognitif" value={kisi.levelKognitif} onChange={e => handleChange('levelKognitif', e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label htmlFor="bentukSoal" className={labelClasses}>Bentuk Soal</label>
                            <input type="text" id="bentukSoal" value={kisi.bentukSoal} onChange={e => handleChange('bentukSoal', e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                </div>
            );
        case 'kunciJawaban':
            const kunci = itemData as KunciJawabanItem;
            return (
                <div>
                    <label htmlFor="jawaban" className={labelClasses}>Kunci Jawaban</label>
                    <textarea id="jawaban" value={kunci.jawaban} onChange={e => handleChange('jawaban', e.target.value)} rows={3} className={inputClasses} />
                </div>
            );
        case 'analisisButirSoal':
            const analisis = itemData as AnalisisItem;
             return (
                 <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="tingkatKesukaran" className={labelClasses}>Tingkat Kesukaran</label>
                            <input type="text" id="tingkatKesukaran" value={analisis.tingkatKesukaran} onChange={e => handleChange('tingkatKesukaran', e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label htmlFor="dayaPembeda" className={labelClasses}>Daya Pembeda</label>
                            <input type="text" id="dayaPembeda" value={analisis.dayaPembeda} onChange={e => handleChange('dayaPembeda', e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="efektivitasPengecoh" className={labelClasses}>Efektivitas Pengecoh</label>
                            <input type="text" id="efektivitasPengecoh" value={analisis.efektivitasPengecoh} onChange={e => handleChange('efektivitasPengecoh', e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label htmlFor="validitas" className={labelClasses}>Validitas</label>
                            <input type="text" id="validitas" value={analisis.validitas} onChange={e => handleChange('validitas', e.target.value)} className={inputClasses} />
                        </div>
                    </div>
                </div>
            );
        default:
            return <p>Tipe item tidak dikenali.</p>;
    }
};

export const EditModal: React.FC<EditModalProps> = ({ state, onClose, onSave }) => {
    const { isOpen, itemType, itemData, isNew } = state;
    const [currentItemData, setCurrentItemData] = useState<EditableItemData | null>(null);
    
    useEffect(() => {
        if (itemData) {
            setCurrentItemData(JSON.parse(JSON.stringify(itemData))); // Deep copy to prevent state mutation
        }
    }, [itemData]);

    if (!isOpen || !itemType || !currentItemData) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(itemType, currentItemData);
    };

    const titleMap: Record<EditableItemType, string> = {
        soal: 'Soal',
        kisiKisi: 'Kisi-Kisi',
        kunciJawaban: 'Kunci Jawaban',
        analisisButirSoal: 'Analisis Butir Soal',
    };
    
    const title = `${isNew ? 'Tambah' : 'Edit'} ${titleMap[itemType]} #${currentItemData.nomor}`;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h3 className="text-xl font-bold text-sky-400">{title}</h3>
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
                <form onSubmit={handleSubmit}>
                    <main className="p-6 overflow-y-auto">
                        <EditModalForm 
                            itemType={itemType}
                            itemData={currentItemData}
                            setItemData={setCurrentItemData}
                        />
                    </main>
                    <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end space-x-3 flex-shrink-0">
                         <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white font-semibold transition-colors">
                            Batal
                        </button>
                         <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors">
                            Simpan Perubahan
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};