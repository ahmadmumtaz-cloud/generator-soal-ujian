import React, { useState, useEffect, useMemo } from 'react';
import type { FormData } from '../types';
import { SUBJECTS_BY_GRADE, GRADE_OPTIONS, QUESTION_TYPE_OPTIONS, LANGUAGE_OPTIONS } from '../constants';

interface QuestionFormProps {
    onGenerate: (formData: FormData) => void;
    isLoading: boolean;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({ onGenerate, isLoading }) => {
    const [formData, setFormData] = useState<FormData>({
        subject: '',
        grade: '',
        questionType: '',
        questionCount: 10,
        topic: '',
        description: '',
        language: 'Bahasa Indonesia',
        // Header fields
        foundationName: 'YAYASAN PENDIDIKAN ISLAM PONDOK MODERN AL GHOZALI',
        schoolName: 'SEKOLAH MENENGAH ATAS ISLAM AL-GHOZALI',
        schoolAddress: 'Jl. Permata Nomor 19 Curug – Gunungsindur – Bogor (16340)',
        assessmentType: 'ASESMEN SUMATIF AKHIR SEMESTER GANJIL',
        academicYear: '2025 - 2026',
        duration: '90 menit',
        teacherName: '',
    });

    // Reset subject when grade changes to ensure valid combination
    useEffect(() => {
        if (formData.grade) {
            setFormData(prev => ({
                ...prev,
                subject: '',
            }));
        }
    }, [formData.grade]);

    const availableSubjects = useMemo(() => {
        if (!formData.grade) return null;
        return SUBJECTS_BY_GRADE[formData.grade as keyof typeof SUBJECTS_BY_GRADE] || null;
    }, [formData.grade]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'questionCount' ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onGenerate(formData);
    };
    
    const renderSubjectOptions = () => {
        if (!availableSubjects) {
            return <option value="" disabled>Pilih Kelas Terlebih Dahulu</option>;
        }

        return Object.entries(availableSubjects).map(([group, subjects]) => (
            <optgroup key={group} label={group}>
                {subjects.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
            </optgroup>
        ));
    };

    const inputClasses = "w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out bg-slate-700/50 text-white placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="form-group">
                    <label htmlFor="grade" className="block text-sm font-medium text-slate-300 mb-1">Kelas</label>
                    <select id="grade" name="grade" value={formData.grade} onChange={handleChange} required className={inputClasses}>
                        <option value="">Pilih Kelas</option>
                        {GRADE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-1">Mata Pelajaran</label>
                    <select id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={inputClasses} disabled={!formData.grade}>
                        <option value="">Pilih Mata Pelajaran</option>
                        {renderSubjectOptions()}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="questionType" className="block text-sm font-medium text-slate-300 mb-1">Jenis Soal</label>
                    <select id="questionType" name="questionType" value={formData.questionType} onChange={handleChange} required className={inputClasses}>
                        <option value="">Pilih Jenis Soal</option>
                        {QUESTION_TYPE_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="questionCount" className="block text-sm font-medium text-slate-300 mb-1">Jumlah Soal</label>
                    <input type="number" id="questionCount" name="questionCount" value={formData.questionCount} onChange={handleChange} min="5" max="50" required className={inputClasses} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="form-group md:col-span-2">
                    <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-1">Topik/Materi</label>
                    <input type="text" id="topic" name="topic" value={formData.topic} onChange={handleChange} placeholder="Contoh: Sistem Pernapasan Manusia" required className={inputClasses} />
                </div>
                <div className="form-group">
                     <label htmlFor="language" className="block text-sm font-medium text-slate-300 mb-1">Bahasa Output</label>
                    <select id="language" name="language" value={formData.language} onChange={handleChange} required className={inputClasses}>
                        {LANGUAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>)}
                    </select>
                </div>
            </div>
             <div className="form-group mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Deskripsi Tambahan (Opsional)</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Fokus pada dampak polusi udara atau mekanisme pertukaran gas..." rows={1} className={`${inputClasses} resize-none`}></textarea>
            </div>

            <details className="bg-slate-900/50 rounded-lg p-1 mb-6">
                <summary className="text-slate-300 font-medium cursor-pointer p-3">Detail Kop Soal (Opsional)</summary>
                <div className="p-3 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="foundationName" className="block text-sm font-medium text-slate-300 mb-1">Nama Yayasan</label>
                        <input type="text" id="foundationName" name="foundationName" value={formData.foundationName} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="schoolName" className="block text-sm font-medium text-slate-300 mb-1">Nama Sekolah</label>
                        <input type="text" id="schoolName" name="schoolName" value={formData.schoolName} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group col-span-1 md:col-span-2">
                        <label htmlFor="schoolAddress" className="block text-sm font-medium text-slate-300 mb-1">Alamat Sekolah</label>
                        <input type="text" id="schoolAddress" name="schoolAddress" value={formData.schoolAddress} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="assessmentType" className="block text-sm font-medium text-slate-300 mb-1">Jenis Asesmen</label>
                        <input type="text" id="assessmentType" name="assessmentType" value={formData.assessmentType} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="academicYear" className="block text-sm font-medium text-slate-300 mb-1">Tahun Ajaran</label>
                        <input type="text" id="academicYear" name="academicYear" value={formData.academicYear} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="duration" className="block text-sm font-medium text-slate-300 mb-1">Waktu</label>
                        <input type="text" id="duration" name="duration" value={formData.duration} onChange={handleChange} className={inputClasses} />
                    </div>
                     <div className="form-group">
                        <label htmlFor="teacherName" className="block text-sm font-medium text-slate-300 mb-1">Pengajar</label>
                        <input type="text" id="teacherName" name="teacherName" value={formData.teacherName} onChange={handleChange} className={inputClasses} />
                    </div>
                </div>
            </details>


            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center">
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memproses...
                    </>
                ) : (
                    "🚀 Generate Paket Soal Lengkap"
                )}
            </button>
        </form>
    );
};