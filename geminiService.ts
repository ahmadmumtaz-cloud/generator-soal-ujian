import { GoogleGenAI, Type } from "@google/genai";
import type { FormData, GeneratedPackage, SoalItem, KunciJawabanItem } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
                subject: { type: Type.STRING, description: "Mata pelajaran yang diminta." },
                grade: { type: Type.STRING, description: "Tingkat kelas yang diminta." },
                topic: { type: Type.STRING, description: "Topik atau materi yang diminta." },
                questionType: { type: Type.STRING, description: "Jenis soal yang diminta." },
                questionCount: { type: Type.INTEGER, description: "Jumlah soal yang diminta." },
            },
        },
        kisiKisi: {
            type: Type.ARRAY,
            description: "Array objek yang merepresentasikan kisi-kisi soal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomor: { type: Type.INTEGER },
                    kompetensiDasar: { type: Type.STRING, description: "Kompetensi dasar yang relevan dengan kurikulum di Indonesia." },
                    indikator: { type: Type.STRING, description: "Indikator pencapaian kompetensi." },
                    levelKognitif: { type: Type.STRING, description: "Level kognitif (C1-C6) berdasarkan Taksonomi Bloom." },
                    bentukSoal: { type: Type.STRING, description: "Bentuk soal (Pilihan Ganda, Uraian, dll)." },
                },
                required: ["nomor", "kompetensiDasar", "indikator", "levelKognitif", "bentukSoal"],
            },
        },
        soal: {
            type: Type.ARRAY,
            description: "Array objek yang berisi butir-butir soal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomor: { type: Type.INTEGER },
                    tingkatKesukaran: { type: Type.STRING, enum: ["Mudah", "Sedang", "Sukar"] },
                    tipeSoal: { type: Type.STRING, enum: ["Pilihan Ganda", "Isian Singkat", "Uraian"] },
                    pertanyaan: { type: Type.STRING, description: "Teks lengkap pertanyaan soal. Gunakan format LaTeX untuk persamaan matematika (contoh: '$\\frac{1}{2}$')." },
                    deskripsiGambar: { type: Type.STRING, description: "Deskripsi rinci dari gambar yang diperlukan untuk soal ini. Jika tidak ada gambar, kosongkan." },
                    pilihan: {
                        type: Type.ARRAY,
                        description: "Array berisi 5 string untuk pilihan jawaban (A-E), hanya untuk tipe Pilihan Ganda.",
                        items: { type: Type.STRING },
                    },
                },
                required: ["nomor", "tingkatKesukaran", "tipeSoal", "pertanyaan"],
            },
        },
        kunciJawaban: {
            type: Type.ARRAY,
            description: "Array objek yang berisi kunci jawaban.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomor: { type: Type.INTEGER },
                    jawaban: { type: Type.STRING, description: "Kunci jawaban. Untuk Pilihan Ganda, formatnya 'A. Teks jawaban'. Untuk Uraian, berikan rubrik penilaian singkat." },
                },
                required: ["nomor", "jawaban"],
            },
        },
        analisisButirSoal: {
            type: Type.ARRAY,
            description: "Array objek berisi analisis teoritis butir soal.",
            items: {
                type: Type.OBJECT,
                properties: {
                    nomor: { type: Type.INTEGER },
                    tingkatKesukaran: { type: Type.STRING, description: "Deskripsi tingkat kesukaran (e.g., 'Sedang (0.30-0.70)')." },
                    dayaPembeda: { type: Type.STRING, description: "Deskripsi daya pembeda (e.g., 'Baik (0.40-0.70)')." },
                    efektivitasPengecoh: { type: Type.STRING, description: "Deskripsi efektivitas pengecoh (e.g., 'Efektif'). Tulis 'Tidak Berlaku' untuk soal non-pilihan ganda." },
                    validitas: { type: Type.STRING, description: "Deskripsi validitas (e.g., 'Valid')." },
                },
                required: ["nomor", "tingkatKesukaran", "dayaPembeda", "efektivitasPengecoh", "validitas"],
            },
        },
    },
    required: ["meta", "kisiKisi", "soal", "kunciJawaban", "analisisButirSoal"],
};

const getPaiInstruction = (subject: string): string => {
    const paiSubjects = ["Pendidikan Agama", "Al-Qur’an Hadis", "Akidah Akhlak", "Fikih", "SKI"];
    if (paiSubjects.some(paiSub => subject.includes(paiSub))) {
        return "Sangat Penting: Untuk mata pelajaran ini, sertakan kutipan ayat Al-Qur'an atau Hadits yang relevan dalam tulisan Arab Utsmani asli, diikuti dengan terjemahannya dalam Bahasa Indonesia.";
    }
    return "";
};


export const generateQuestionPackage = async (formData: FormData): Promise<GeneratedPackage> => {
    const { subject, grade, questionType, questionCount, topic, description, language } = formData;

    const getLanguageInstruction = (lang: string): string => {
        switch (lang) {
            case "Bahasa Indonesia":
                return "Gunakan Bahasa Indonesia secara eksklusif untuk seluruh konten (soal, pilihan, kunci jawaban, dll).";
            case "Bahasa Inggris":
                return "Use English exclusively for all content (questions, options, answer keys, etc.).";
            case "Bahasa Sunda":
                return "Gunakan Basa Sunda sacara éksklusif pikeun sadaya eusi (soal, pilihan, konci jawaban, jsb.).";
            case "Bahasa Arab":
                return "استخدم اللغة العربية حصريًا لجميع المحتويات (الأسئلة، الخيارات، مفاتيح الإجابات، إلخ).";
            default:
                return "Gunakan Bahasa Indonesia untuk seluruh konten.";
        }
    };

    const languageInstruction = getLanguageInstruction(language);
    const paiInstruction = getPaiInstruction(subject);


    const prompt = `
Anda adalah seorang ahli penyusun soal profesional (assessment specialist) untuk kurikulum pendidikan di Indonesia.
Tugas Anda adalah membuat satu paket soal lengkap berdasarkan permintaan berikut:

**PERMINTAAN PENGGUNA:**
- Mata Pelajaran: ${subject}
- Kelas: ${grade}
- Topik/Materi: ${topic}
- Jenis Soal: ${questionType}
- Jumlah Soal: ${questionCount}
- Deskripsi Tambahan: ${description || 'Tidak ada'}

**ATURAN GENERASI KONTEN (WAJIB DIIKUTI):**

1.  **Bahasa:**
    ${languageInstruction}

2.  **Konten Khusus Mata Pelajaran:**
    ${paiInstruction}

3.  **Soal Matematika/Sains:**
    - Untuk semua persamaan matematika, fisika, atau kimia, **WAJIB** gunakan format LaTeX.
    - Contoh Inline: 'Hitung nilai dari $\\sqrt{16}$ !'
    - Contoh Blok: 'Selesaikan persamaan berikut: $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{}\\pi}{2}$$'

4.  **Soal Berbasis Gambar:**
    - Jika sebuah soal memerlukan gambar (diagram, grafik, peta, ilustrasi), JANGAN buat gambarnya.
    - Sebagai gantinya, berikan deskripsi yang SANGAT DETAIL dan jelas tentang gambar tersebut di field \`deskripsiGambar\`.
    - Contoh: "Sebuah diagram sel hewan yang menunjukkan organel utama seperti nukleus, mitokondria, dan membran sel. Beri label pada bagian-bagian ini."

5.  **Struktur Paket:**
    a.  **Kisi-Kisi Soal**: Sesuai format, termasuk Kompetensi Dasar, Indikator, Level Kognitif, dan Bentuk Soal.
    b.  **Butir Soal**: Teks pertanyaan yang jelas dan tidak ambigu.
    c.  **Kunci Jawaban**: Jawaban yang benar. Untuk soal uraian, berikan rubrik penilaian atau poin-poin kunci jawaban.
    d.  **Analisis Butir Soal (Teoritis)**: Prediksi kualitas setiap butir soal.

Pastikan sebaran tingkat kesukaran soal (Mudah, Sedang, Sulit) proporsional. Untuk Pilihan Ganda, sediakan 5 pilihan jawaban (A, B, C, D, E).
Pastikan seluruh output dalam format JSON yang valid sesuai dengan skema yang diberikan.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as Omit<GeneratedPackage, 'meta'> & { meta: Omit<GeneratedPackage['meta'], 'headerInfo'>};

        // If a question includes an image description, add a prompt to the question text.
        parsedData.soal.forEach(item => {
            if (item.deskripsiGambar && item.deskripsiGambar.trim() !== '') {
                const imagePrompt = "Perhatikan gambar berikut untuk menjawab soal.\n\n";
                item.pertanyaan = imagePrompt + item.pertanyaan;
            }
        });

        // Inject header info into the final package
        const finalPackage: GeneratedPackage = {
            ...parsedData,
            meta: {
                ...parsedData.meta,
                headerInfo: {
                    foundationName: formData.foundationName,
                    schoolName: formData.schoolName,
                    schoolAddress: formData.schoolAddress,
                    assessmentType: formData.assessmentType,
                    academicYear: formData.academicYear,
                    duration: formData.duration,
                    teacherName: formData.teacherName,
                }
            }
        };

        return finalPackage;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Gagal menghasilkan paket soal. Model AI mungkin mengalami masalah. Silakan coba lagi.");
    }
};

// --- INTERACTIVE AI FUNCTIONS ---

const singleSoalSchema = {
    type: Type.OBJECT,
    properties: {
        nomor: { type: Type.INTEGER },
        tingkatKesukaran: { type: Type.STRING, enum: ["Mudah", "Sedang", "Sukar"] },
        tipeSoal: { type: Type.STRING, enum: ["Pilihan Ganda", "Isian Singkat", "Uraian"] },
        pertanyaan: { type: Type.STRING, description: "Teks lengkap pertanyaan soal. Gunakan format LaTeX untuk persamaan matematika." },
        deskripsiGambar: { type: Type.STRING, description: "Deskripsi rinci dari gambar yang diperlukan. Jika tidak ada, kosongkan." },
        pilihan: {
            type: Type.ARRAY,
            description: "Array berisi 5 string untuk pilihan jawaban (A-E), hanya untuk Pilihan Ganda.",
            items: { type: Type.STRING },
        },
    },
    required: ["nomor", "tingkatKesukaran", "tipeSoal", "pertanyaan"],
};


export const regenerateSoalItem = async (
    originalSoal: SoalItem,
    meta: GeneratedPackage['meta']
): Promise<SoalItem> => {
    const prompt = `
Anda adalah seorang ahli penyusun soal (assessment specialist).
Tugas Anda adalah membuat ulang (regenerate) satu butir soal berdasarkan soal asli dan konteksnya.
Soal baru harus berbeda dari soal asli, namun tetap menguji indikator dan tingkat kesulitan yang sama.

**Konteks Paket Soal:**
- Mata Pelajaran: ${meta.subject}
- Kelas: ${meta.grade}
- Topik/Materi: ${meta.topic}

**Soal Asli (Nomor ${originalSoal.nomor}):**
- Tingkat Kesukaran: ${originalSoal.tingkatKesukaran}
- Tipe Soal: ${originalSoal.tipeSoal}
- Pertanyaan: ${originalSoal.pertanyaan}

**Instruksi:**
1.  Buat satu soal baru yang berbeda, bisa dengan skenario, angka, atau pendekatan yang berbeda.
2.  Pertahankan tingkat kesukaran, tipe soal, dan nomor soal yang sama.
3.  Pastikan soal baru relevan dengan mata pelajaran, kelas, dan topik yang diberikan.
4.  Gunakan format LaTeX untuk matematika jika diperlukan.
5.  Jika soal asli memerlukan gambar, buat deskripsi gambar yang relevan untuk soal baru.
6.  Hasilkan output dalam format JSON yang valid sesuai skema yang diberikan.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: singleSoalSchema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SoalItem;
    } catch (error) {
        console.error("Error regenerating question:", error);
        throw new Error("Gagal meregenerasi soal. Model AI mungkin mengalami masalah.");
    }
};

export const explainAnswer = async (
    soal: SoalItem,
    kunciJawaban: KunciJawabanItem,
    meta: GeneratedPackage['meta']
): Promise<string> => {
    const prompt = `
Anda adalah seorang guru ahli dan komunikator yang hebat.
Tugas Anda adalah memberikan penjelasan yang jelas, ringkas, dan mudah dipahami untuk sebuah soal, seolah-olah Anda sedang menjelaskannya kepada siswa kelas ${meta.grade}.

**Konteks:**
- Mata Pelajaran: ${meta.subject}
- Topik/Materi: ${meta.topic}

**Soal (Nomor ${soal.nomor}):**
- Pertanyaan: ${soal.pertanyaan}
${soal.pilihan ? `- Pilihan:\n${soal.pilihan.join('\n')}` : ''}

**Kunci Jawaban:**
- ${kunciJawaban.jawaban}

**Instruksi:**
1.  Mulai dengan menyatakan kembali jawaban yang benar.
2.  Berikan penjelasan langkah-demi-langkah atau pemaparan konsep yang logis mengapa jawaban tersebut benar.
3.  Gunakan bahasa yang sesuai untuk siswa kelas ${meta.grade}. Hindari jargon yang terlalu teknis.
4.  Jika ini soal Pilihan Ganda, jelaskan secara singkat mengapa pilihan lain salah (jika relevan).
5.  Akhiri dengan kesimpulan atau poin kunci yang bisa diingat siswa.
6.  Jangan gunakan format JSON. Hasilkan jawaban hanya dalam bentuk teks biasa (plain text).
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
             config: { temperature: 0.7 }
        });
        return response.text;
    } catch (error) {
        console.error("Error explaining answer:", error);
        throw new Error("Gagal menjelaskan jawaban. Model AI mungkin mengalami masalah.");
    }
};