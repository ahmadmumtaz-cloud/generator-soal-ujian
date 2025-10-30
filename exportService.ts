import saveAs from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle } from 'docx';
import type { GeneratedPackage } from '../types';

const generateFileName = (meta: GeneratedPackage['meta'], extension: string) => {
    return `Paket Soal ${meta.subject} Kelas ${meta.grade}.${extension}`;
};

// --- PLAIN TEXT EXPORT ---
export const exportToPlainText = (pkg: GeneratedPackage) => {
    const { meta, kisiKisi, soal, kunciJawaban, analisisButirSoal } = pkg;
    const { headerInfo } = meta;
    let content = `============================================\n`;
    if (headerInfo.foundationName) content += `${headerInfo.foundationName.toUpperCase()}\n`;
    if (headerInfo.schoolName) content += `${headerInfo.schoolName.toUpperCase()}\n`;
    if (headerInfo.schoolAddress) content += `${headerInfo.schoolAddress}\n`;
    content += `--------------------------------------------\n`;
    if (headerInfo.assessmentType) content += `${headerInfo.assessmentType.toUpperCase()}\n`;
    if (headerInfo.academicYear) content += `TAHUN AJARAN ${headerInfo.academicYear}\n`;
    content += `\n`;
    content += `Mata Pelajaran: ${meta.subject}\n`;
    content += `Kelas: ${meta.grade}\n`;
    if (headerInfo.duration) content += `Waktu: ${headerInfo.duration}\n`;
    content += `============================================\n\n`;


    content += `--- KISI-KISI SOAL ---\n`;
    kisiKisi.forEach(item => {
        content += `No: ${item.nomor}\n`;
        content += `Kompetensi Dasar: ${item.kompetensiDasar}\n`;
        content += `Indikator: ${item.indikator}\n`;
        content += `Level Kognitif: ${item.levelKognitif}\n`;
        content += `Bentuk Soal: ${item.bentukSoal}\n\n`;
    });

    content += `--- SOAL ---\n`;
    content += `A. BERILAH TANDA SILANG (X) PADA SALAH SATU JAWABAN YANG PALING BENAR !\n\n`
    soal.forEach(item => {
        content += `${item.nomor}. ${item.pertanyaan}\n`;
        if (item.pilihan) {
            item.pilihan.forEach(opt => content += `${opt}\n`);
        }
        content += `\n`;
    });

    content += `--- KUNCI JAWABAN ---\n`;
    kunciJawaban.forEach(item => {
        content += `${item.nomor}. ${item.jawaban}\n`;
    });
    content += `\n`;

    content += `--- ANALISIS BUTIR SOAL ---\n`;
    analisisButirSoal.forEach(item => {
        content += `No: ${item.nomor} | Kesukaran: ${item.tingkatKesukaran} | Pembeda: ${item.dayaPembeda} | Pengecoh: ${item.efektivitasPengecoh} | Validitas: ${item.validitas}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, generateFileName(meta, 'txt'));
};


// --- PDF EXPORT ---
export const exportToPDF = (pkg: GeneratedPackage) => {
    const { meta, kisiKisi, soal, kunciJawaban, analisisButirSoal } = pkg;
    const { headerInfo } = meta;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 15;

    // --- Custom Header ---
    if (headerInfo.foundationName) {
        doc.setFontSize(14).setFont('helvetica', 'bold');
        doc.text(headerInfo.foundationName.toUpperCase(), pageW / 2, yPos, { align: 'center' });
        yPos += 7;
    }
    if (headerInfo.schoolName) {
        doc.setFontSize(16).setFont('helvetica', 'bold');
        doc.text(headerInfo.schoolName.toUpperCase(), pageW / 2, yPos, { align: 'center' });
        yPos += 7;
    }
    if (headerInfo.schoolAddress) {
        doc.setFontSize(10).setFont('helvetica', 'normal');
        doc.text(headerInfo.schoolAddress, pageW / 2, yPos, { align: 'center' });
        yPos += 5;
    }

    // Line Separator
    doc.setLineWidth(1);
    doc.line(margin, yPos, pageW - margin, yPos);
    yPos += 8;

    if (headerInfo.assessmentType) {
        doc.setFontSize(12).setFont('helvetica', 'bold');
        doc.text(headerInfo.assessmentType.toUpperCase(), pageW / 2, yPos, { align: 'center' });
        yPos += 6;
    }
    if (headerInfo.academicYear) {
        doc.setFontSize(12).setFont('helvetica', 'normal');
        doc.text(`TAHUN AJARAN ${headerInfo.academicYear}`, pageW / 2, yPos, { align: 'center' });
        yPos += 10;
    }
    
    // Metadata Table
    autoTable(doc, {
        startY: yPos,
        body: [
            ['Kelas', `: ${meta.grade}`, 'Hari/Tanggal', ': ..................... / .....................'],
            ['Mata Pelajaran', `: ${meta.subject}`, 'Jam Ke-', ': .....................'],
            ['Pengajar', `: ${headerInfo.teacherName || '.....................'}`, 'Waktu', `: ${headerInfo.duration || '.....................'}`],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 0.5 },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 65 },
            2: { cellWidth: 30 },
            3: { cellWidth: 'auto' },
        }
    });
    yPos = (doc as any).autoTable.previous.finalY + 10;

    // Soal Section
    doc.setFontSize(11).setFont('helvetica', 'bold');
    doc.text('A. BERILAH TANDA SILANG (X) PADA SALAH SATU JAWABAN YANG PALING BENAR !', margin, yPos);
    yPos += 8;

    doc.setFontSize(11).setFont('helvetica', 'normal');
    soal.forEach(item => {
        if (yPos > 270) { doc.addPage(); yPos = 20; }
        const questionText = doc.splitTextToSize(`${item.nomor}. ${item.pertanyaan}`, pageW - (margin * 2) - 5);
        doc.text(questionText, margin, yPos, {
            align: 'left',
            lineHeightFactor: 1.5
        });
        yPos += (questionText.length * 5);
        if (item.pilihan) {
            item.pilihan.forEach(opt => {
                if (yPos > 275) { doc.addPage(); yPos = 20; }
                const optionText = doc.splitTextToSize(opt, pageW - (margin * 2) - 10);
                doc.text(optionText, margin + 5, yPos, { lineHeightFactor: 1.5 });
                yPos += (optionText.length * 5);
            });
        }
        yPos += 3;
    });

    // Kisi-Kisi, Kunci, etc. on new pages
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('Kunci Jawaban', margin, yPos);
    yPos += 8;
    doc.setFontSize(11).setFont('helvetica', 'normal');
    kunciJawaban.forEach(item => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(`${item.nomor}. ${item.jawaban}`, margin, yPos, { lineHeightFactor: 1.5 });
        yPos += 5;
    });
    yPos += 10;
    
    // Kisi-kisi Table
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('Kisi-Kisi Soal', margin, yPos);
    yPos += 6;
    autoTable(doc, {
        startY: yPos,
        head: [['No', 'Kompetensi Dasar', 'Indikator', 'Level Kognitif', 'Bentuk Soal']],
        body: kisiKisi.map(item => [item.nomor, item.kompetensiDasar, item.indikator, item.levelKognitif, item.bentukSoal]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });
    yPos = (doc as any).autoTable.previous.finalY + 15;


    // Analisis Table
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    doc.setFontSize(14).setFont('helvetica', 'bold');
    doc.text('Analisis Butir Soal', margin, yPos);
    yPos += 6;
    autoTable(doc, {
        startY: yPos,
        head: [['No', 'Tingkat Kesukaran', 'Daya Pembeda', 'Efektivitas Pengecoh', 'Validitas']],
        body: analisisButirSoal.map(item => [item.nomor, item.tingkatKesukaran, item.dayaPembeda, item.efektivitasPengecoh, item.validitas]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(generateFileName(meta, 'pdf'));
};

// --- DOCX EXPORT ---
export const exportToDOCX = (pkg: GeneratedPackage) => {
    const { meta, kisiKisi, soal, kunciJawaban, analisisButirSoal } = pkg;
    const { headerInfo } = meta;

    const createHeader = () => {
        const headerParts = [];
        if (headerInfo.foundationName) headerParts.push(new Paragraph({ text: headerInfo.foundationName.toUpperCase(), alignment: AlignmentType.CENTER, style: "headerStyle" }));
        if (headerInfo.schoolName) headerParts.push(new Paragraph({ text: headerInfo.schoolName.toUpperCase(), alignment: AlignmentType.CENTER, style: "schoolNameStyle" }));
        if (headerInfo.schoolAddress) headerParts.push(new Paragraph({ text: headerInfo.schoolAddress, alignment: AlignmentType.CENTER, style: "addressStyle" }));
        
        // Horizontal Line
        headerParts.push(new Paragraph({
            children: [],
            border: { bottom: { color: "auto", space: 1, style: BorderStyle.SINGLE, size: 6 } },
            spacing: { after: 200 }
        }));
        
        if (headerInfo.assessmentType) headerParts.push(new Paragraph({ text: headerInfo.assessmentType.toUpperCase(), alignment: AlignmentType.CENTER, style: "assessmentTypeStyle" }));
        if (headerInfo.academicYear) headerParts.push(new Paragraph({ text: `TAHUN AJARAN ${headerInfo.academicYear}`, alignment: AlignmentType.CENTER, style: "academicYearStyle" }));
        
        // Metadata Table
        const metadataTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [15, 35, 15, 35],
            borders: { inside: { style: BorderStyle.NONE }, top: {style: BorderStyle.NONE}, bottom: {style: BorderStyle.NONE}, left: {style: BorderStyle.NONE}, right: {style: BorderStyle.NONE} },
            rows: [
                new TableRow({ children: [
                    new TableCell({ children: [new Paragraph('Kelas')] }),
                    new TableCell({ children: [new Paragraph(`: ${meta.grade}`)] }),
                    new TableCell({ children: [new Paragraph('Hari/Tanggal')] }),
                    new TableCell({ children: [new Paragraph(': ...... / ......')] }),
                ]}),
                new TableRow({ children: [
                    new TableCell({ children: [new Paragraph('Mata Pelajaran')] }),
                    new TableCell({ children: [new Paragraph(`: ${meta.subject}`)] }),
                    new TableCell({ children: [new Paragraph('Jam Ke-')] }),
                    new TableCell({ children: [new Paragraph(': ......')] }),
                ]}),
                 new TableRow({ children: [
                    new TableCell({ children: [new Paragraph('Pengajar')] }),
                    new TableCell({ children: [new Paragraph(`: ${headerInfo.teacherName || '......'}`)] }),
                    new TableCell({ children: [new Paragraph('Waktu')] }),
                    new TableCell({ children: [new Paragraph(`: ${headerInfo.duration || '......'}`)] }),
                ]}),
            ],
        });
        headerParts.push(metadataTable);
        
        return headerParts;
    };
    

    const sections = [
        {
            properties: {
                page: {
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            children: [
                ...createHeader(),
                new Paragraph({ text: 'A. BERILAH TANDA SILANG (X) PADA SALAH SATU JAWABAN YANG PALING BENAR !', style: 'instructionStyle' }),
                new Paragraph(""), // spacing
                ...soal.flatMap(item => [
                    new Paragraph({ children: [
                        new TextRun({ text: `${item.nomor}. `, bold: false }),
                        new TextRun(`${item.pertanyaan}`),
                    ],
                    indent: { hanging: 280 }
                    }),
                    ...(item.pilihan ? item.pilihan.map(opt => new Paragraph({ text: opt, indent: { left: 280 } })) : []),
                    new Paragraph(""), // spacing
                ]),
                
                // Kunci, Kisi-kisi, etc.
                new Paragraph({ text: 'Kunci Jawaban', heading: HeadingLevel.HEADING_2, pageBreakBefore: true }),
                ...kunciJawaban.map(item => new Paragraph(`${item.nomor}. ${item.jawaban}`)),
                
                new Paragraph({ text: 'Kisi-Kisi Soal', heading: HeadingLevel.HEADING_2 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            tableHeader: true,
                            children: ['No', 'Kompetensi Dasar', 'Indikator', 'Level Kognitif', 'Bentuk Soal'].map(header => new TableCell({ children: [new Paragraph({ text: header, bold: true })] })),
                        }),
                        ...kisiKisi.map(item => new TableRow({
                            children: [item.nomor, item.kompetensiDasar, item.indikator, item.levelKognitif, item.bentukSoal].map(text => new TableCell({ children: [new Paragraph(String(text))] }))
                        }))
                    ],
                }),

                new Paragraph({ text: 'Analisis Butir Soal', heading: HeadingLevel.HEADING_2 }),
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                             tableHeader: true,
                            children: ['No', 'Tingkat Kesukaran', 'Daya Pembeda', 'Efektivitas Pengecoh', 'Validitas'].map(header => new TableCell({ children: [new Paragraph({ text: header, bold: true })] })),
                        }),
                        ...analisisButirSoal.map(item => new TableRow({
                            children: [item.nomor, item.tingkatKesukaran, item.dayaPembeda, item.efektivitasPengecoh, item.validitas].map(text => new TableCell({ children: [new Paragraph(String(text))] }))
                        }))
                    ],
                }),
            ],
        },
    ];

    const doc = new Document({
        styles: {
            paragraphStyles: [
                { id: "headerStyle", name: "Header Style", run: { size: 28, bold: true } },
                { id: "schoolNameStyle", name: "School Name Style", run: { size: 32, bold: true } },
                { id: "addressStyle", name: "Address Style", run: { size: 20 } },
                { id: "assessmentTypeStyle", name: "Assessment Type Style", run: { size: 24, bold: true } },
                { id: "academicYearStyle", name: "Academic Year Style", run: { size: 24 } },
                { id: "instructionStyle", name: "Instruction Style", run: { size: 22, bold: true }, spacing: { before: 200, after: 200 } },
            ],
        },
        sections
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, generateFileName(meta, 'docx'));
    });
};