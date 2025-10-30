import type { Packer } from "docx";

export interface FormData {
    subject: string;
    grade: string;
    questionType: string;
    questionCount: number;
    topic: string;
    description: string;
    language: string;
    // Header Details
    foundationName?: string;
    schoolName?: string;
    schoolAddress?: string;
    assessmentType?: string;
    academicYear?: string;
    duration?: string;
    teacherName?: string;
}

export interface KisiKisiItem {
    nomor: number;
    kompetensiDasar: string;
    indikator: string;
    levelKognitif: string;
    bentukSoal: string;
}

export interface SoalItem {
    nomor: number;
    tingkatKesukaran: 'Mudah' | 'Sedang' | 'Sukar';
    pertanyaan: string;
    deskripsiGambar?: string; // Deskripsi untuk soal yang membutuhkan gambar
    tipeSoal: 'Pilihan Ganda' | 'Isian Singkat' | 'Uraian';
    pilihan?: string[];
}

export interface KunciJawabanItem {
    nomor: number;
    jawaban: string;
}

export interface AnalisisItem {
    nomor: number;
    tingkatKesukaran: string;
    dayaPembeda: string;
    efektivitasPengecoh: string;
    validitas: string;
}

export interface GeneratedPackage {
    kisiKisi: KisiKisiItem[];
    soal: SoalItem[];
    kunciJawaban: KunciJawabanItem[];
    analisisButirSoal: AnalisisItem[];
    meta: {
      subject: string;
      grade: string;
      topic: string;
      questionType: string;
      questionCount: number;
      headerInfo: {
        foundationName?: string;
        schoolName?: string;
        schoolAddress?: string;
        assessmentType?: string;
        academicYear?: string;
        duration?: string;
        teacherName?: string;
      }
    }
}

export interface ActionFeedback {
    type: 'success' | 'error';
    message: string;
    questionId: number;
}

// Types for CRUD functionality
export type EditableItemType = 'kisiKisi' | 'soal' | 'kunciJawaban' | 'analisisButirSoal';

export type EditableItemData = KisiKisiItem | SoalItem | KunciJawabanItem | AnalisisItem;

export interface EditModalState {
    isOpen: boolean;
    itemType: EditableItemType | null;
    itemData: EditableItemData | null;
    isNew: boolean;
}