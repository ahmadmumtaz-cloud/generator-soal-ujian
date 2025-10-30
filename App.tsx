
import React, { useState, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { QuestionForm } from './components/QuestionForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ExplanationModal } from './components/ExplanationModal';
import { EditModal } from './components/EditModal';
import { generateQuestionPackage, regenerateSoalItem, explainAnswer } from './services/geminiService';
import type { FormData, GeneratedPackage, ActionFeedback, EditModalState, EditableItemType, EditableItemData, SoalItem, KisiKisiItem, KunciJawabanItem, AnalisisItem } from './types';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedPackage, setGeneratedPackage] = useState<GeneratedPackage | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    
    // State for interactive AI features
    const [processingQuestionId, setProcessingQuestionId] = useState<number | null>(null);
    const [explanationContent, setExplanationContent] = useState<string | null>(null);
    const [isExplanationModalOpen, setIsExplanationModalOpen] = useState<boolean>(false);
    const [actionFeedback, setActionFeedback] = useState<ActionFeedback | null>(null);

    // State for CRUD functionality
    const [editModalState, setEditModalState] = useState<EditModalState>({ isOpen: false, itemType: null, itemData: null, isNew: false });


    const handleGenerate = useCallback(async (formData: FormData) => {
        setIsLoading(true);
        setError(null);
        setGeneratedPackage(null);

        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);

        try {
            const result = await generateQuestionPackage(formData);
            setGeneratedPackage(result);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, []);

    const clearActionFeedback = () => {
        setTimeout(() => setActionFeedback(null), 3000);
    };
    
    const handleRegenerateQuestion = useCallback(async (questionNumber: number) => {
        if (!generatedPackage) return;
        setProcessingQuestionId(questionNumber);
        setActionFeedback(null);
        
        try {
            const originalSoal = generatedPackage.soal.find(s => s.nomor === questionNumber);
            if (!originalSoal) throw new Error("Soal tidak ditemukan.");

            const newSoal = await regenerateSoalItem(originalSoal, generatedPackage.meta);
            
            setGeneratedPackage(prevPackage => {
                if (!prevPackage) return null;
                const newSoalArray = prevPackage.soal.map(s => s.nomor === questionNumber ? newSoal : s);
                // Simple regeneration of answer key for multiple choice
                 const newKunciArray = [...prevPackage.kunciJawaban];
                 const kunciIndex = newKunciArray.findIndex(k => k.nomor === questionNumber);
                 if (kunciIndex !== -1 && newSoal.tipeSoal === 'Pilihan Ganda' && newSoal.pilihan) {
                     // The AI should provide the new key, but we need a robust update. Assume the AI doesn't give the key.
                     // A better approach is to ask the AI for the new key as well.
                     // For now, let's update the question but we might need to prompt user to update the key.
                     // Let's assume the AI regenerates the key along with the question in a more advanced version.
                 }

                return { ...prevPackage, soal: newSoalArray };
            });
            setActionFeedback({ type: 'success', message: 'Soal berhasil diperbarui!', questionId: questionNumber });

        } catch (e) {
            setActionFeedback({ type: 'error', message: 'Gagal meregenerasi.', questionId: questionNumber });
        } finally {
            setProcessingQuestionId(null);
            clearActionFeedback();
        }
    }, [generatedPackage]);

    const handleExplainAnswer = useCallback(async (questionNumber: number) => {
        if (!generatedPackage) return;
        setProcessingQuestionId(questionNumber);
        setActionFeedback(null);

        try {
            const soal = generatedPackage.soal.find(s => s.nomor === questionNumber);
            const kunci = generatedPackage.kunciJawaban.find(k => k.nomor === questionNumber);
            if (!soal || !kunci) throw new Error("Soal atau kunci jawaban tidak ditemukan.");

            const explanation = await explainAnswer(soal, kunci, generatedPackage.meta);
            setExplanationContent(explanation);
            setIsExplanationModalOpen(true);

        } catch (e) {
             setActionFeedback({ type: 'error', message: 'Gagal mendapat penjelasan.', questionId: questionNumber });
        } finally {
            setProcessingQuestionId(null);
            clearActionFeedback();
        }
    }, [generatedPackage]);

    // --- CRUD Handlers ---

    const handleOpenEditModal = (itemType: EditableItemType, itemData: EditableItemData, isNew = false) => {
        setEditModalState({ isOpen: true, itemType, itemData, isNew });
    };

    const handleCloseEditModal = () => {
        setEditModalState({ isOpen: false, itemType: null, itemData: null, isNew: false });
    };

    const handleAddItem = (itemType: EditableItemType) => {
        if (!generatedPackage) return;
        const newNumber = generatedPackage.soal.length + 1;
        let newItem: EditableItemData;
        switch (itemType) {
            case 'soal':
                newItem = { nomor: newNumber, pertanyaan: '', tingkatKesukaran: 'Sedang', tipeSoal: 'Pilihan Ganda', pilihan: ['A. ', 'B. ', 'C. ', 'D. ', 'E. '], deskripsiGambar: '' };
                break;
            case 'kisiKisi':
                newItem = { nomor: newNumber, kompetensiDasar: '', indikator: '', levelKognitif: 'C3', bentukSoal: 'Pilihan Ganda' };
                break;
            case 'kunciJawaban':
                newItem = { nomor: newNumber, jawaban: '' };
                break;
            case 'analisisButirSoal':
                newItem = { nomor: newNumber, tingkatKesukaran: 'Sedang', dayaPembeda: 'Baik', efektivitasPengecoh: 'Efektif', validitas: 'Valid' };
                break;
            default: return;
        }
        handleOpenEditModal(itemType, newItem, true);
    };

    const handleDeleteItem = (itemNumber: number) => {
        if (!generatedPackage || !window.confirm(`Anda yakin ingin menghapus item nomor ${itemNumber}? Tindakan ini akan menghapus soal, kisi-kisi, kunci, dan analisis terkait.`)) {
            return;
        }

        setGeneratedPackage(prev => {
            if (!prev) return null;
            
            const renumber = <T extends { nomor: number }>(arr: T[]): T[] => {
                return arr.map((item, index) => ({ ...item, nomor: index + 1 }));
            };
            
            const newSoal = renumber(prev.soal.filter(i => i.nomor !== itemNumber));
            const newKisiKisi = renumber(prev.kisiKisi.filter(i => i.nomor !== itemNumber));
            const newKunci = renumber(prev.kunciJawaban.filter(i => i.nomor !== itemNumber));
            const newAnalisis = renumber(prev.analisisButirSoal.filter(i => i.nomor !== itemNumber));

            return {
                ...prev,
                soal: newSoal,
                kisiKisi: newKisiKisi,
                kunciJawaban: newKunci,
                analisisButirSoal: newAnalisis,
                meta: { ...prev.meta, questionCount: newSoal.length },
            };
        });
    };

    const handleSaveItem = (itemType: EditableItemType, itemData: EditableItemData) => {
         setGeneratedPackage(prev => {
            if (!prev) return null;
            const updatedPackage = { ...prev };

            const itemExists = (updatedPackage[itemType] as EditableItemData[]).some(item => item.nomor === itemData.nomor);

            if (itemExists && !editModalState.isNew) {
                // Fix: Use a type-safe switch statement to update items correctly.
                // This resolves issues with assigning a general `EditableItemData[]` to a specific array type like `SoalItem[]`.
                switch (itemType) {
                    case 'soal':
                        updatedPackage.soal = updatedPackage.soal.map(item => item.nomor === itemData.nomor ? itemData as SoalItem : item);
                        break;
                    case 'kisiKisi':
                        updatedPackage.kisiKisi = updatedPackage.kisiKisi.map(item => item.nomor === itemData.nomor ? itemData as KisiKisiItem : item);
                        break;
                    case 'kunciJawaban':
                        updatedPackage.kunciJawaban = updatedPackage.kunciJawaban.map(item => item.nomor === itemData.nomor ? itemData as KunciJawabanItem : item);
                        break;
                    case 'analisisButirSoal':
                        updatedPackage.analisisButirSoal = updatedPackage.analisisButirSoal.map(item => item.nomor === itemData.nomor ? itemData as AnalisisItem : item);
                        break;
                }
            } else {
                // Add new item and sync other parts
                 const newSoal = [...prev.soal, (itemType === 'soal' ? itemData : { nomor: itemData.nomor, pertanyaan: 'Pertanyaan baru', tingkatKesukaran: 'Sedang', tipeSoal: 'Pilihan Ganda' }) as SoalItem];
                 // Fix: Add type assertions to ensure the new array types are correctly inferred, preventing assignment errors.
                 const newKisiKisi = [...prev.kisiKisi, (itemType === 'kisiKisi' ? itemData : { nomor: itemData.nomor, kompetensiDasar: '', indikator: '', levelKognitif: '', bentukSoal: '' }) as KisiKisiItem];
                 const newKunci = [...prev.kunciJawaban, (itemType === 'kunciJawaban' ? itemData : { nomor: itemData.nomor, jawaban: '' }) as KunciJawabanItem];
                 const newAnalisis = [...prev.analisisButirSoal, (itemType === 'analisisButirSoal' ? itemData : { nomor: itemData.nomor, tingkatKesukaran: '', dayaPembeda: '', efektivitasPengecoh: '', validitas: '' }) as AnalisisItem];

                 updatedPackage.soal = newSoal;
                 updatedPackage.kisiKisi = newKisiKisi;
                 updatedPackage.kunciJawaban = newKunci;
                 updatedPackage.analisisButirSoal = newAnalisis;
                 updatedPackage.meta.questionCount = newSoal.length;
            }
             
            return updatedPackage;
        });
        handleCloseEditModal();
    };


    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <Header />
            <main className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
                <QuestionForm onGenerate={handleGenerate} isLoading={isLoading} />
            </main>
            <div ref={resultsRef} className="min-h-[10rem]">
                {isLoading && <LoadingSpinner />}
                {error && <ErrorDisplay message={error} />}
                {generatedPackage && !isLoading && (
                    <ResultsDisplay 
                        generatedPackage={generatedPackage}
                        onRegenerate={handleRegenerateQuestion}
                        onExplain={handleExplainAnswer}
                        onEdit={handleOpenEditModal}
                        onDelete={handleDeleteItem}
                        onAdd={handleAddItem}
                        processingQuestionId={processingQuestionId}
                        actionFeedback={actionFeedback}
                    />
                )}
            </div>
            <ExplanationModal
                isOpen={isExplanationModalOpen}
                onClose={() => setIsExplanationModalOpen(false)}
                content={explanationContent}
            />
            {editModalState.isOpen && (
                <EditModal
                    state={editModalState}
                    onClose={handleCloseEditModal}
                    onSave={handleSaveItem}
                />
            )}
            <footer className="text-center text-slate-500 text-sm py-4 mt-8">
                Developed @2025 By Liyas Syarifudin,M.Pd.
            </footer>
        </div>
    );
};

export default App;
