import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Medicine, Patient, TimelineScheduleEntry } from '../types';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
    autoTable: (options: Record<string, unknown>) => void;
  }
}

interface PdfReportOptions {
  patient?: Patient;
  medicines?: Array<{ medicine: Medicine; entry: TimelineScheduleEntry }>;
  centerName?: string;
  pharmacistSignature?: boolean;
}

const getHourLabel = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const getHourPeriod = (hour: number): string => {
  if (hour >= 6 && hour <= 12) return 'Manana';
  if (hour >= 13 && hour <= 18) return 'Tarde';
  if (hour >= 19 && hour <= 23) return 'Noche';
  return 'Medianoche';
};

const TIMELINE_HOURS = [0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const CLINICAL_BLUE = [12, 58, 111] as [number, number, number];
const DARK_TEXT = [26, 26, 26] as [number, number, number];

export const generatePdfReport = (options: PdfReportOptions): void => {
  const {
    patient,
    medicines = [],
    centerName = 'Centro de Salud / Hospital General',
    pharmacistSignature = true
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add header
  const addHeader = () => {
    doc.setFontSize(18);
    doc.setTextColor(...CLINICAL_BLUE);
    doc.setFont('Helvetica', 'bold');
    doc.text(centerName, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Servicio de Farmacia', margin, yPosition);
    yPosition += 12;

    // Separator line
    doc.setDrawColor(...CLINICAL_BLUE);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // Helper function to add patient information
  const addPatientInfo = () => {
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(...CLINICAL_BLUE);
    doc.text('INFORMACIÓN DEL PACIENTE', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(...DARK_TEXT);

    const patientInfo = [
      { label: 'Nombre:', value: patient?.fullName || 'No especificado' },
      { label: 'Cédula:', value: patient?.cedula || 'N/A' },
      { label: 'Edad:', value: patient?.dateOfBirth ? calculateAge(patient.dateOfBirth).toString() : 'N/A' },
      { label: 'Alergias/Contraindicaciones:', value: patient?.medicalConditions || 'No reportadas' }
    ];

    patientInfo.forEach(({ label, value }) => {
      doc.setFont('Helvetica', 'bold');
      doc.text(label, margin + 2, yPosition);
      doc.setFont('Helvetica', 'normal');
      doc.text(value || 'N/A', margin + 40, yPosition);
      yPosition += 6;
    });

    yPosition += 4;
  };

  // Helper function to add Planning Visual matrix
  const addPlanningVisual = () => {
    checkNewPage(50);

    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(...CLINICAL_BLUE);
    doc.text('PLANNING VISUAL - MATRIZ HORARIA', margin, yPosition);
    yPosition += 10;

    if (medicines.length === 0) {
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text('No hay medicamentos asignados en el calendario.', margin, yPosition);
      yPosition += 10;
      return;
    }

    // Prepare header row with hours and time period labels
    const headerRow = ['Medicamento', ...TIMELINE_HOURS.map(h => `${getHourLabel(h)}\n${getHourPeriod(h)}`)];

    // Prepare data rows
    const tableData: (string | { content: string; styles?: Record<string, unknown> })[][] = [];

    medicines.forEach(({ medicine, entry }) => {
      // Medicine name and dose indicators row
      const row: (string | { content: string; styles?: Record<string, unknown> })[] = [medicine.comercialName];
      
      TIMELINE_HOURS.forEach(hour => {
        const hasDose = entry.hours.includes(hour);
        row.push({
          content: hasDose ? '✓' : '',
          styles: {
            fillColor: hasDose ? [255, 255, 255] : [245, 245, 245],
            textColor: hasDose ? [12, 58, 111] : [200, 200, 200],
            fontStyle: hasDose ? 'bold' : 'normal',
            fontSize: hasDose ? 12 : 8,
            halign: 'center',
            valign: 'middle'
          }
        });
      });

      tableData.push(row);

      // Add instructions row if exists
      if (entry.instructions && entry.instructions.trim()) {
        const instructionsRow: (string | { content: string; styles?: Record<string, unknown> })[] = [
          {
            content: `Instrucciones: ${entry.instructions}`,
            styles: {
              colSpan: TIMELINE_HOURS.length + 1,
              fillColor: [232, 244, 253],
              textColor: [60, 60, 60],
              fontSize: 8,
              halign: 'left',
              valign: 'middle',
              cellPadding: 2
            }
          }
        ];
        tableData.push(instructionsRow);
      }
    });

    const startY = yPosition;
    doc.autoTable({
      startY,
      head: [headerRow],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [12, 58, 111],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
        cellPadding: 1.5,
        lineWidth: 0.3,
        lineColor: [0, 0, 0]
      },
      bodyStyles: {
        textColor: [26, 26, 26],
        fontSize: 8,
        halign: 'center',
        valign: 'middle',
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [100, 100, 100]
      },
      columnStyles: {
        0: { 
          cellWidth: 35,
          halign: 'left',
          fontStyle: 'bold',
          fontSize: 8,
          fillColor: [227, 242, 253]
        },
        ...TIMELINE_HOURS.reduce((acc, _, index) => {
          acc[index + 1] = { cellWidth: (contentWidth - 35) / TIMELINE_HOURS.length };
          return acc;
        }, {} as Record<number, { cellWidth: number }>)
      },
      didParseCell: (data: {
        section: string;
        column: { index: number };
        cell: { styles: { fontSize: number; lineHeight: number } };
      }) => {
        // Ensure time period headers are properly styled
        if (data.section === 'head' && data.column.index > 0) {
          data.cell.styles.fontSize = 6;
          data.cell.styles.lineHeight = 1.1;
        }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (minSpaceNeeded: number = 30) => {
    if (yPosition + minSpaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      addFooter();
    }
  };

  // Helper function to add footer
  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Generado el: ${dateStr} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, margin, pageHeight - 10);

    if (pharmacistSignature) {
      doc.text('_________________________', margin, pageHeight - 16);
      doc.text('Firma del Farmacéutico', margin, pageHeight - 12);
    }
  };

  // Header
  addHeader();

  // Patient Information
  addPatientInfo();

  // Planning Visual Matrix
  addPlanningVisual();

  // Treatment Schedule Section
  checkNewPage(40);

  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...CLINICAL_BLUE);
  doc.text('PAUTA DE ADMINISTRACIÓN DE MEDICAMENTOS', margin, yPosition);
  yPosition += 10;

  if (medicines.length === 0) {
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text('No hay medicamentos asignados en el tratamiento.', margin, yPosition);
    yPosition += 10;
  } else {
    const tableData = medicines.map(({ medicine, entry }) => {
      const hoursText = entry.hours.map(h => getHourLabel(h)).join(', ');
      return [
        medicine.comercialName,
        medicine.activePrinciples || '',
        hoursText,
        entry.instructions || ''
      ];
    });

    const startY = yPosition;
    doc.autoTable({
      startY,
      head: [['Medicamento', 'Principio Activo', 'Horarios', 'Instrucciones']],
      body: tableData,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [12, 58, 111],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        textColor: [26, 26, 26],
        fontSize: 9,
        halign: 'left',
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [232, 244, 253]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: contentWidth - 105 }
      }
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Warnings Section
  checkNewPage(50);

  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...CLINICAL_BLUE);
  doc.text('ADVERTENCIAS IMPORTANTES', margin, yPosition);
  yPosition += 8;

  const warnings = [
    'Siga estrictamente las dosis y horarios indicados',
    'No suspenda el tratamiento sin consulta médica',
    'Consulte al profesional de salud ante cualquier reacción adversa',
    'Mantenga los medicamentos fuera del alcance de niños'
  ];

  doc.setFontSize(9);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);

  warnings.forEach(warning => {
    const split = doc.splitTextToSize(`• ${warning}`, contentWidth - 4);
    doc.text(split, margin + 2, yPosition);
    yPosition += split.length * 5 + 2;
    checkNewPage(20);
  });

  // Footer
  addFooter();

  // Generate filename
  const fileName = patient
    ? `plan_tratamiento_${patient.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`
    : `plan_tratamiento_${new Date().toISOString().split('T')[0]}`;

  doc.save(`${fileName}.pdf`);
};

// Helper function to calculate age
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
