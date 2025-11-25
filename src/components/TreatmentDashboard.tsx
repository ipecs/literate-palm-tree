import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Pill, FileText, Download, ChevronRight, Check, X, Edit2, Trash2, Printer, Package, Activity, Database, FileType, Users } from 'lucide-react';
import { StorageService } from '../storage/localStorage';
import { Medicine, Patient, TimelineScheduleEntry } from '../types';
import * as XLSX from 'xlsx-js-style';
import { generatePdfReport } from '../utils/pdfGenerator';

interface SelectedMedicine {
  medicine: Medicine;
  selected: boolean;
}

interface ScheduleEntryWithMedicine {
  entry: TimelineScheduleEntry;
  medicine: Medicine;
}

const REPORT_WARNINGS = [
  'Siga estrictamente las dosis y horarios indicados',
  'No suspenda el tratamiento sin consulta médica',
  'Consulte al profesional de salud ante cualquier reacción adversa',
  'Mantenga los medicamentos fuera del alcance de niños'
] as const;

export const TreatmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'selection' | 'information' | 'calendar' | 'report' | 'database'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);
  const [patientName, setPatientName] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [timelineSchedule, setTimelineSchedule] = useState<TimelineScheduleEntry[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineFormData, setMedicineFormData] = useState({
    comercialName: '',
    activePrinciples: '',
    pharmacologicalGroup: '',
    administrationInstructions: '',
    conservationInstructions: '',
    additionalInfo: '',
    imageUrl: '',
    iconType: 'pill' as 'pill' | 'syrup' | 'injection' | 'capsule' | 'cream'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMedicines(StorageService.getMedicines());
    setPatients(StorageService.getPatients());
  };

  const getLastBackupDate = () => {
    const backup = localStorage.getItem('pharmalocal_last_backup');
    return backup ? new Date(backup).toLocaleDateString('es-ES') : 'No hay copias';
  };

  const getTotalPharmacologicalGroups = () => {
    const groups = new Set(medicines.map(m => m.pharmacologicalGroup || m.pharmacologicalAction?.split(',')[0].trim()).filter(Boolean));
    return groups.size;
  };

  const filteredMedicines = medicines.filter(m =>
    m.comercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.activePrinciples?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const toggleMedicineSelection = (medicine: Medicine) => {
    setSelectedMedicines(prev => {
      const existing = prev.find(item => item.medicine.id === medicine.id);
      if (existing) {
        return prev.filter(item => item.medicine.id !== medicine.id);
      } else {
        return [...prev, { medicine, selected: true }];
      }
    });
  };

  const getMedicineIcon = (iconType: string) => {
    switch (iconType) {
      case 'syrup': return '🥤';
      case 'injection': return '💉';
      case 'capsule': return '🟢';
      case 'cream': return '🧴';
      default: return '💊';
    }
  };

  const exportToExcel = (data: Record<string, unknown>[], fileName: string, sheetName: string = 'Datos') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Auto-adjust column widths
    const colWidths = Object.keys(data[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportMedicinesToExcel = () => {
    const formattedData = medicines.map(m => ({
      'Nombre Comercial': m.comercialName,
      'Grupo Farmacológico': m.pharmacologicalGroup || '',
      'Principio Activo': m.activePrinciples || '',
      'Acción Farmacológica': m.pharmacologicalAction || '',
      'Administración': m.administrationInstructions || '',
      'Conservación': m.conservationInstructions || '',
      'Información Adicional': m.additionalInfo || '',
      'Fecha de Creación': new Date(m.createdAt).toLocaleDateString('es-ES')
    }));
    
    exportToExcel(formattedData, 'inventario_medicamentos', 'Inventario');
  };

  const getHourEmoji = (hour: number): string => {
    if (hour >= 6 && hour <= 12) return '☀️';
    if (hour >= 13 && hour <= 18) return '🌤️';
    if (hour >= 19 && hour <= 23) return '🌙';
    return '🛏️';
  };

  const getHourLabel = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const exportReportToExcel = () => {
    if (!showReport) {
      alert('Por favor genera el informe antes de exportar');
      return;
    }

    const reportDate = new Date();
    const planDate = reportDate.toLocaleDateString('es-ES');
    const generatedAt = reportDate.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const scheduleEntriesWithMedicine: ScheduleEntryWithMedicine[] = timelineSchedule
      .map(entry => {
        const medicine = medicines.find(m => m.id === entry.medicineId);
        return medicine ? { entry, medicine } : null;
      })
      .filter((item): item is ScheduleEntryWithMedicine => Boolean(item));

    const headerData = [
      { Campo: 'INFORME', Valor: 'PLAN DE TRATAMIENTO FARMACOLÓGICO' },
      { Campo: 'Sistema', Valor: 'Sistema de Gestión Farmacéutica PharmaLocal' },
      { Campo: '', Valor: '' },
      { Campo: 'PACIENTE', Valor: patientName || 'No especificado' },
      { Campo: 'FECHA DEL PLAN', Valor: planDate },
      { Campo: 'GENERADO EL', Valor: generatedAt },
      { Campo: '', Valor: '' }
    ];

    const hasScheduledMedicines = scheduleEntriesWithMedicine.length > 0;

    const scheduleData: Array<Record<string, string>> = [{
      Horario: 'PAUTA HORARIA DE ADMINISTRACIÓN',
      Medicamento: '',
      'Principio Activo': '',
      'Grupo Farmacológico': '',
      Horarios: '',
      Instrucciones: ''
    }];

    if (hasScheduledMedicines) {
      scheduleEntriesWithMedicine.forEach(({ entry, medicine }) => {
        const hoursText = entry.hours.map(h => getHourLabel(h)).join(', ');
        scheduleData.push({
          Horario: '',
          Medicamento: medicine.comercialName,
          'Principio Activo': medicine.activePrinciples || '',
          'Grupo Farmacológico': medicine.pharmacologicalGroup || medicine.pharmacologicalAction?.split(',')[0].trim() || '',
          Horarios: hoursText,
          Instrucciones: entry.instructions || ''
        });
      });
    } else {
      scheduleData.push({
        Horario: 'Sin medicamentos asignados en el calendario',
        Medicamento: '',
        'Principio Activo': '',
        'Grupo Farmacológico': '',
        Horarios: '',
        Instrucciones: ''
      });
    }

    const warningsData: Array<Record<string, string>> = [
      { Sección: '', Contenido: '' },
      { Sección: '⚠️ ADVERTENCIAS IMPORTANTES', Contenido: '' },
      ...REPORT_WARNINGS.map(warning => ({ Sección: '', Contenido: `• ${warning}` }))
    ];

    const wb = XLSX.utils.book_new();

    const wsHeader = XLSX.utils.json_to_sheet(headerData);
    wsHeader['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsHeader, 'Información General');

    const wsSchedule = XLSX.utils.json_to_sheet(scheduleData);
    wsSchedule['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 30 },
      { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(wb, wsSchedule, 'Pauta Horaria');

    const wsWarnings = XLSX.utils.json_to_sheet(warningsData);
    wsWarnings['!cols'] = [{ wch: 35 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsWarnings, 'Advertencias');

    const buildPlanningVisualSheet = () => {
      const worksheet: XLSX.WorkSheet = {};
      const merges: XLSX.Range[] = [];
      const rowHeights: { hpt?: number }[] = [];
      const planningHours = [0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
      const totalColumns = planningHours.length + 1;
      const lastColumnIndex = totalColumns - 1;

      // Professional border styling
      const thinBorder = {
        top: { style: 'thin' as const, color: { rgb: '000000' } },
        bottom: { style: 'thin' as const, color: { rgb: '000000' } },
        left: { style: 'thin' as const, color: { rgb: '000000' } },
        right: { style: 'thin' as const, color: { rgb: '000000' } }
      };

      const thickBorder = {
        top: { style: 'medium' as const, color: { rgb: '000000' } },
        bottom: { style: 'medium' as const, color: { rgb: '000000' } },
        left: { style: 'medium' as const, color: { rgb: '000000' } },
        right: { style: 'medium' as const, color: { rgb: '000000' } }
      };

      const baseStyle: XLSX.CellStyle = {
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: thinBorder
      };

      const applyStyle = (style: Partial<XLSX.CellStyle> = {}): XLSX.CellStyle => ({
        ...baseStyle,
        ...style,
        alignment: {
          ...(baseStyle.alignment || {}),
          ...(style.alignment || {})
        },
        border: style.border || thinBorder
      });

      const setCell = (rowNumber: number, columnNumber: number, value: string, style: Partial<XLSX.CellStyle> = {}) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowNumber - 1, c: columnNumber - 1 });
        worksheet[cellAddress] = { v: value, t: 's', s: applyStyle(style) };
      };

      const setRowHeight = (rowNumber: number, height: number) => {
        rowHeights[rowNumber - 1] = { hpt: height };
      };

      const formatHour = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

      let currentRow = 1;

      // Title row
      setCell(currentRow, 1, 'PLANIFICACIÓN HORARIA DEL TRATAMIENTO', {
        font: { bold: true, sz: 20, color: { rgb: '0C395C' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } }
      });
      merges.push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: lastColumnIndex } });
      setRowHeight(currentRow, 32);
      currentRow++;

      // Patient and date info row
      const patientLabel = patientName || 'No especificado';
      setCell(currentRow, 1, `Hospital General - Servicio de Farmacia | Paciente: ${patientLabel} | Fecha: ${planDate}`, {
        font: { bold: true, sz: 12, color: { rgb: '0C395C' } },
        fill: { patternType: 'solid', fgColor: { rgb: 'E0F2F1' } }
      });
      merges.push({ s: { r: currentRow - 1, c: 0 }, e: { r: currentRow - 1, c: lastColumnIndex } });
      setRowHeight(currentRow, 24);
      currentRow++;

      // Header row - Medicine column
      setCell(currentRow, 1, 'Medicamento', {
        font: { bold: true, sz: 11, color: { rgb: 'FFFFFF' } },
        fill: { patternType: 'solid', fgColor: { rgb: '0C395C' } },
        alignment: { vertical: 'center', horizontal: 'center' }
      });

      // Header row - Hour columns with emojis
      planningHours.forEach((hour, index) => {
        const columnIndex = index + 2;
        setCell(currentRow, columnIndex, `${formatHour(hour)}\n${getHourEmoji(hour)}`, {
          font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
          fill: { patternType: 'solid', fgColor: { rgb: '0C395C' } },
          alignment: { vertical: 'center', horizontal: 'center' }
        });
      });
      setRowHeight(currentRow, 46);
      currentRow++;

      const sortedEntries = [...scheduleEntriesWithMedicine].sort((a, b) =>
        a.medicine.comercialName.localeCompare(b.medicine.comercialName)
      );

      let nextRow = currentRow;

      if (sortedEntries.length === 0) {
        // No medicines message
        setCell(nextRow, 1, 'Sin medicamentos planificados en el calendario', {
          font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
          fill: { patternType: 'solid', fgColor: { rgb: 'FFA500' } }
        });
        merges.push({ s: { r: nextRow - 1, c: 0 }, e: { r: nextRow - 1, c: lastColumnIndex } });
        setRowHeight(nextRow, 28);
        nextRow++;
      } else {
        // Medicine rows
        sortedEntries.forEach(({ entry, medicine }) => {
          // Medicine name row - Light blue background
          setCell(nextRow, 1, medicine.comercialName, {
            font: { bold: true, sz: 12, color: { rgb: '0D47A1' } },
            fill: { patternType: 'solid', fgColor: { rgb: 'E3F2FD' } },
            alignment: { vertical: 'center', horizontal: 'left' }
          });

          // Dose grid cells
          planningHours.forEach((hour) => {
            const columnIndex = planningHours.indexOf(hour) + 2;
            const hasDose = entry.hours.includes(hour);
            
            setCell(nextRow, columnIndex, hasDose ? '1' : '', {
              font: hasDose ? { bold: true, sz: 12, color: { rgb: '000000' } } : { sz: 11, color: { rgb: 'BDBDBD' } },
              fill: {
                patternType: 'solid',
                fgColor: { rgb: hasDose ? 'FFFFFF' : 'F5F5F5' }
              },
              alignment: { vertical: 'center', horizontal: 'center' },
              border: hasDose ? thickBorder : thinBorder
            });
          });

          setRowHeight(nextRow, 32);
          nextRow++;

          // Instructions row - Merged cells
          const instructionsText = entry.instructions?.trim() || 'Sin instrucciones adicionales registradas.';
          setCell(nextRow, 1, `Instrucciones: ${instructionsText}`, {
            font: { sz: 11, color: { rgb: '004D40' } },
            fill: { patternType: 'solid', fgColor: { rgb: 'E0F7FA' } },
            alignment: { vertical: 'center', horizontal: 'left', wrapText: true }
          });
          merges.push({ s: { r: nextRow - 1, c: 0 }, e: { r: nextRow - 1, c: lastColumnIndex } });
          setRowHeight(nextRow, 24);
          nextRow++;
        });
      }

      // Column widths: Column A = 40 chars, Hour columns = 5 chars each
      worksheet['!cols'] = [
        { wch: 40 },
        ...planningHours.map(() => ({ wch: 5 }))
      ];
      worksheet['!rows'] = rowHeights;
      worksheet['!merges'] = merges;

      const lastUsedRow = Math.max(nextRow - 1, 3);
      worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: lastUsedRow - 1, c: lastColumnIndex }
      });

      return worksheet;
    };

    const planningSheet = buildPlanningVisualSheet();
    XLSX.utils.book_append_sheet(wb, planningSheet, 'Planning Visual');

    const normalizedPatientName = (patientName || 'paciente')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '');

    const formattedDateForFile = reportDate.toISOString().split('T')[0];
    const fileName = `plan_tratamiento_${normalizedPatientName || 'paciente'}_${formattedDateForFile}`;

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportReportToPdf = () => {
    if (!showReport) {
      alert('Por favor genera el informe antes de exportar');
      return;
    }

    if (!selectedPatientId) {
      alert('Por favor selecciona un paciente antes de generar el PDF');
      return;
    }

    const medicinesForPdf = timelineSchedule
      .map(entry => {
        const medicine = medicines.find(m => m.id === entry.medicineId);
        return medicine ? { medicine, entry } : null;
      })
      .filter((item): item is { medicine: Medicine; entry: TimelineScheduleEntry } => Boolean(item));

    // Get patient data using selectedPatientId
    const patient = StorageService.getPatientById(selectedPatientId);

    if (!patient) {
      alert('Error: No se encontró la información del paciente seleccionado');
      return;
    }

    generatePdfReport({
      patient,
      medicines: medicinesForPdf,
      centerName: 'Hospital General - Servicio de Farmacia',
      pharmacistSignature: true
    });
  };

  const saveMedicine = () => {
    if (!medicineFormData.comercialName) {
      alert('Por favor ingresa el nombre del medicamento');
      return;
    }

    const medicineData = {
      ...medicineFormData,
      createdAt: editingMedicine ? editingMedicine.createdAt : Date.now()
    };

    if (editingMedicine) {
      StorageService.updateMedicine(editingMedicine.id, medicineData);
    } else {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        ...medicineData,
        createdAt: Date.now()
      };
      StorageService.addMedicine(newMedicine);
    }

    loadData();
    setShowMedicineModal(false);
    setEditingMedicine(null);
    setMedicineFormData({
      comercialName: '',
      activePrinciples: '',
      pharmacologicalGroup: '',
      administrationInstructions: '',
      conservationInstructions: '',
      additionalInfo: '',
      imageUrl: '',
      iconType: 'pill'
    });
  };

  const deleteMedicine = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
      StorageService.deleteMedicine(id);
      loadData();
    }
  };

  const editMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setMedicineFormData({
      comercialName: medicine.comercialName,
      activePrinciples: medicine.activePrinciples || '',
      pharmacologicalGroup: medicine.pharmacologicalGroup || '',
      administrationInstructions: medicine.administrationInstructions || '',
      conservationInstructions: medicine.conservationInstructions || '',
      additionalInfo: medicine.additionalInfo || '',
      imageUrl: medicine.imageUrl || '',
      iconType: medicine.iconType || 'pill'
    });
    setShowMedicineModal(true);
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const printReport = () => {
    window.print();
  };

  const renderDashboard = () => {
    const patients = StorageService.getPatients();
    const treatments = StorageService.getTreatments();
    const activeTreatments = treatments.filter(t => t.isActive).length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pacientes Registrados</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{patients.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Medicamentos en Inventario</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{medicines.length}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <Pill className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tratamientos Activos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeTreatments}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Grupos Farmacológicos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{getTotalPharmacologicalGroups()}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-500">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Última Copia de Seguridad
            </h3>
            <p className="text-2xl font-bold text-gray-900">{getLastBackupDate()}</p>
            <p className="text-sm text-gray-600 mt-2">
              {getLastBackupDate() !== 'No hay copias' ? 
                'Copia de seguridad realizada correctamente' : 
                'No se han realizado copias de seguridad'
              }
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Consejos Rápidos
            </h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Usa la pestaña "Tratamiento" para seleccionar medicamentos</li>
              <li>• Planifica dosis en el "Calendario"</li>
              <li>• Genera informes profesionales para imprimir</li>
              <li>• Exporta datos a Excel para análisis avanzados</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Instrucciones de Inicio
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-clinical-600 text-white">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Registra Pacientes</h3>
                <p className="text-gray-600 text-sm">Ve a la sección "Pacientes" y crea nuevos registros de pacientes con sus datos personales.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-clinical-600 text-white">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Crea tu Inventario de Medicamentos</h3>
                <p className="text-gray-600 text-sm">Ve a "Medicamentos" y registra todos los medicamentos disponibles con su información farmacológica completa.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-clinical-600 text-white">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Planifica Tratamientos</h3>
                <p className="text-gray-600 text-sm">En "Tratamientos", asigna medicamentos a pacientes definiendo horarios y pautas personalizadas.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-md bg-clinical-600 text-white">
                  4
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Genera Hojas de Tratamiento</h3>
                <p className="text-gray-600 text-sm">Crea informes visuales y profesionales listos para imprimir y entregar a los pacientes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSelection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o principio activo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
            />
          </div>
          <div className="text-sm text-gray-600">
            {selectedMedicines.length} seleccionados
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredMedicines.map(medicine => {
            const isSelected = selectedMedicines.some(item => item.medicine.id === medicine.id);
            return (
              <div
                key={medicine.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-clinical-600 bg-clinical-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleMedicineSelection(medicine)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getMedicineIcon(medicine.iconType || 'pill')}</span>
                      <h3 className="font-semibold text-gray-900">{medicine.comercialName}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{medicine.activePrinciples || ''}</p>
                    <p className="text-xs text-gray-500">{medicine.pharmacologicalAction?.substring(0, 50) || ''}...</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'bg-clinical-600 border-clinical-600' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderInformation = () => {
    const selectedMedsData = selectedMedicines.map(item => item.medicine);
    const groupedByPharmacological = selectedMedsData.reduce((acc, medicine) => {
      const group = medicine.pharmacologicalGroup || medicine.pharmacologicalAction?.split(',')[0].trim() || 'Sin Clasificar';
      if (!acc[group]) acc[group] = [];
      acc[group].push(medicine);
      return acc;
    }, {} as Record<string, Medicine[]>);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Medicamentos Seleccionados</h2>
          {selectedMedsData.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay medicamentos seleccionados. Ve a la pestaña "Tratamiento" para seleccionar.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByPharmacological).map(([group, meds]) => (
                <div key={group} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-clinical-700 mb-4">{group}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meds.map(medicine => (
                      <div key={medicine.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-2xl">{getMedicineIcon(medicine.iconType || 'pill')}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{medicine.comercialName}</h4>
                          <p className="text-sm text-gray-600">{medicine.activePrinciples || ''}</p>
                          <p className="text-xs text-gray-500 mt-1">{medicine.pharmacologicalAction || ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const TIMELINE_HOURS = [0, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const toggleHourForMedicine = (medicineId: string, hour: number) => {
    setTimelineSchedule(prev => {
      const existing = prev.find(entry => entry.medicineId === medicineId);
      if (existing) {
        const newHours = existing.hours.includes(hour)
          ? existing.hours.filter(h => h !== hour)
          : [...existing.hours, hour].sort((a, b) => a - b);
        
        if (newHours.length === 0) {
          return prev.filter(entry => entry.medicineId !== medicineId);
        }
        
        return prev.map(entry =>
          entry.medicineId === medicineId
            ? { ...entry, hours: newHours }
            : entry
        );
      } else {
        return [...prev, { medicineId, hours: [hour], instructions: '' }];
      }
    });
  };

  const updateTimelineInstructions = (medicineId: string, instructions: string) => {
    setTimelineSchedule(prev =>
      prev.map(entry =>
        entry.medicineId === medicineId
          ? { ...entry, instructions }
          : entry
      )
    );
  };

  const handlePatientSelection = (patientId: string) => {
    setSelectedPatientId(patientId);
    if (patientId) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        setPatientName(patient.fullName);
      }
    } else {
      setPatientName('');
    }
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Seleccionar Paciente
          </label>
          {patients.length === 0 ? (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
              <p className="text-amber-800">
                No hay pacientes registrados en el sistema. Por favor, dirígete a la sección <strong>"Pacientes"</strong> para crear pacientes antes de asignar tratamientos.
              </p>
            </div>
          ) : (
            <select
              value={selectedPatientId}
              onChange={e => handlePatientSelection(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent bg-white"
            >
              <option value="">Seleccione un paciente...</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} - {patient.cedula}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedMedicines.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No hay medicamentos seleccionados. Ve a la pestaña "Tratamiento" para seleccionar.</p>
        ) : (
          <div className="space-y-6">
            {selectedMedicines.map(item => {
              const scheduleEntry = timelineSchedule.find(e => e.medicineId === item.medicine.id);
              return (
                <div key={item.medicine.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{getMedicineIcon(item.medicine.iconType || 'pill')}</span>
                    <h3 className="font-semibold text-lg text-gray-900">{item.medicine.comercialName}</h3>
                  </div>

                  <div className="mb-4 overflow-x-auto">
                    <div className="flex gap-1 pb-2">
                      {TIMELINE_HOURS.map(hour => {
                        const isSelected = scheduleEntry?.hours.includes(hour) ?? false;
                        return (
                          <button
                            key={hour}
                            onClick={() => toggleHourForMedicine(item.medicine.id, hour)}
                            className={`px-2 py-2 rounded text-xs font-medium whitespace-nowrap transition-all ${
                              isSelected
                                ? 'bg-clinical-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {getHourLabel(hour)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instrucciones Adicionales
                    </label>
                    <input
                      type="text"
                      value={scheduleEntry?.instructions || ''}
                      onChange={(e) => updateTimelineInstructions(item.medicine.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                      placeholder="Ej: Con comida, Después de desayunar, etc."
                    />
                  </div>

                  {scheduleEntry && scheduleEntry.hours.length > 0 && (
                    <div className="mt-3 p-3 bg-clinical-50 rounded">
                      <p className="text-sm text-clinical-700">
                        <strong>Horarios seleccionados:</strong> {scheduleEntry.hours.map(h => getHourLabel(h)).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Vista Previa del Informe</h2>
          <div className="flex gap-3">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-clinical-600 text-white px-4 py-2 rounded-lg hover:bg-clinical-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Generar Informe
            </button>
            {showReport && (
              <>
                <button
                  onClick={exportReportToPdf}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FileType className="w-4 h-4" />
                  Descargar PDF Nativo
                </button>
                <button
                  onClick={exportReportToExcel}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Guardar como Excel
                </button>
                <button
                  onClick={printReport}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Guardar PDF
                </button>
              </>
            )}
          </div>
        </div>

        {!showReport ? (
          <p className="text-gray-600 text-center py-8">Configura el tratamiento en las pestañas anteriores y luego genera el informe.</p>
        ) : (
          <div id="treatment-report" className="space-y-6">
            <div className="text-center border-b-2 border-clinical-700 pb-4">
              <h1 className="text-3xl font-bold text-clinical-700">PLAN DE TRATAMIENTO FARMACOLÓGICO</h1>
              <p className="text-gray-600 mt-2">Sistema de Gestión Farmacéutica PharmaLocal</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">PACIENTE</p>
                <p className="text-xl font-bold text-gray-900">{patientName || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">FECHA DEL PLAN</p>
                <p className="text-xl font-bold text-gray-900">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-clinical-600">PAUTA HORARIA DE ADMINISTRACIÓN</h2>
              <div className="space-y-4">
                {timelineSchedule.length === 0 ? (
                  <div className="border-2 border-clinical-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-center text-gray-600">Sin medicamentos asignados en el calendario</p>
                  </div>
                ) : (
                  timelineSchedule.map((entry, index) => {
                    const medicine = medicines.find(m => m.id === entry.medicineId);
                    if (!medicine) return null;
                    return (
                      <div key={index} className="border-2 border-clinical-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getMedicineIcon(medicine.iconType || 'pill')}</span>
                            <div>
                              <h3 className="font-bold text-lg text-clinical-700">{medicine.comercialName}</h3>
                              <p className="text-sm text-gray-600">{medicine.activePrinciples || ''}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><strong>Horarios:</strong> {entry.hours.map(h => getHourLabel(h)).join(', ')}</p>
                          {entry.instructions && (
                            <p><strong>Instrucciones:</strong> {entry.instructions}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t-2 border-clinical-600 pt-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="font-semibold text-amber-900 mb-2">ADVERTENCIAS IMPORTANTES</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  {REPORT_WARNINGS.map(warning => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center text-xs text-gray-600">
              Documento generado el {new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Base de Datos de Medicamentos</h2>
          <div className="flex gap-3">
            <button
              onClick={exportMedicinesToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Descargar Inventario (.xlsx)
            </button>
            <button
              onClick={() => setShowMedicineModal(true)}
              className="flex items-center gap-2 bg-clinical-600 text-white px-4 py-2 rounded-lg hover:bg-clinical-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Medicamento
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Icono</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Nombre Comercial</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Grupo Farmacológico</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Principio Activo</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Acción Farmacológica</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Administración</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(medicine => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="text-2xl">{getMedicineIcon(medicine.iconType || 'pill')}</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{medicine.comercialName}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.pharmacologicalGroup || '-'}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.activePrinciples || '-'}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.pharmacologicalAction?.substring(0, 50) || '-'}...</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.administrationInstructions?.substring(0, 30) || '-'}...</td>
                  <td className="border border-gray-200 px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editMedicine(medicine)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMedicine(medicine.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Inicio', icon: Activity },
    { id: 'selection', label: 'Tratamiento', icon: Pill },
    { id: 'information', label: 'Información', icon: FileText },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'report', label: 'Informe', icon: Printer },
    { id: 'database', label: 'BD Medicamentos', icon: Database }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a PharmaLocal</h1>
        <p className="text-gray-600 mt-2">Sistema de Gestión de Atención Farmacéutica</p>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'selection' | 'information' | 'calendar' | 'report' | 'database')}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-clinical-600 text-clinical-700 bg-clinical-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'selection' && renderSelection()}
      {activeTab === 'information' && renderInformation()}
      {activeTab === 'calendar' && renderCalendar()}
      {activeTab === 'report' && renderReport()}
      {activeTab === 'database' && renderDatabase()}

      {showMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMedicine ? 'Editar Medicamento' : 'Nuevo Medicamento'}
              </h2>
              <button onClick={() => setShowMedicineModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    value={medicineFormData.comercialName}
                    onChange={e => setMedicineFormData({ ...medicineFormData, comercialName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tipo de Icono
                  </label>
                  <select
                    value={medicineFormData.iconType}
                    onChange={e => setMedicineFormData({ ...medicineFormData, iconType: e.target.value as 'pill' | 'syrup' | 'injection' | 'capsule' | 'cream' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  >
                    <option value="pill">Pastilla 💊</option>
                    <option value="capsule">Cápsula 🟢</option>
                    <option value="syrup">Jarabe 🥤</option>
                    <option value="injection">Inyección 💉</option>
                    <option value="cream">Crema 🧴</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Principios Activos
                </label>
                <input
                  type="text"
                  value={medicineFormData.activePrinciples}
                  onChange={e => setMedicineFormData({ ...medicineFormData, activePrinciples: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Grupo Farmacológico
                </label>
                <input
                  type="text"
                  value={medicineFormData.pharmacologicalGroup}
                  onChange={e => setMedicineFormData({ ...medicineFormData, pharmacologicalGroup: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Analgésico, Antibiótico, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Acción Farmacológica
                </label>
                <input
                  type="text"
                  placeholder="Descripción de la acción farmacológica"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent bg-gray-100"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Se deduce automáticamente del Grupo Farmacológico</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de Administración
                </label>
                <textarea
                  value={medicineFormData.administrationInstructions}
                  onChange={e => setMedicineFormData({ ...medicineFormData, administrationInstructions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de Conservación
                </label>
                <textarea
                  value={medicineFormData.conservationInstructions}
                  onChange={e => setMedicineFormData({ ...medicineFormData, conservationInstructions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  URL de Imagen (opcional)
                </label>
                <input
                  type="text"
                  value={medicineFormData.imageUrl}
                  onChange={e => setMedicineFormData({ ...medicineFormData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Información Adicional
                </label>
                <textarea
                  value={medicineFormData.additionalInfo}
                  onChange={e => setMedicineFormData({ ...medicineFormData, additionalInfo: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={() => setShowMedicineModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveMedicine}
                className="flex-1 bg-clinical-600 text-white px-4 py-2 rounded-lg hover:bg-clinical-700 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};