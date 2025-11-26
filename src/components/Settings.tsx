import { useState, useEffect } from 'react';
import { Download, Upload, Trash2, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { StorageService } from '../storage/db';
import * as XLSX from 'xlsx-js-style';

export const Settings = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState({ patients: 0, medicines: 0, treatments: 0, adverseReactions: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const [patients, medicines, treatments, adverseReactions] = await Promise.all([
        StorageService.getPatients(),
        StorageService.getMedicines(),
        StorageService.getTreatments(),
        StorageService.getAdverseReactions()
      ]);
      setStats({
        patients: patients.length,
        medicines: medicines.length,
        treatments: treatments.length,
        adverseReactions: adverseReactions.length
      });
    };
    loadStats();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    const data = await StorageService.exportData();
    const element = document.createElement('a');
    const file = new Blob([data], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmalocal_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showMessage('success', 'Datos exportados correctamente');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        try {
          const jsonString = event.target?.result as string;
          if (await StorageService.importData(jsonString)) {
            showMessage('success', 'Datos importados correctamente. Por favor recarga la página.');
            setTimeout(() => window.location.reload(), 2000);
          } else {
            showMessage('error', 'El archivo de respaldo no es válido');
          }
        } catch (error) {
          showMessage('error', 'Error al importar los datos');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAllData = async () => {
    await StorageService.clearAllData();
    setShowDeleteConfirm(false);
    showMessage('success', 'Todos los datos han sido eliminados. Por favor recarga la página.');
    setTimeout(() => window.location.reload(), 2000);
  };

  const exportFullReportToExcel = async () => {
    const medicines = await StorageService.getMedicines();
    const patients = await StorageService.getPatients();
    const treatments = await StorageService.getTreatments();
    const adverseReactions = await StorageService.getAdverseReactions();
    
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Resumen
    const summaryData = [
      { 'Concepto': 'Total Medicamentos', 'Valor': medicines.length },
      { 'Concepto': 'Total Pacientes', 'Valor': patients.length },
      { 'Concepto': 'Total Tratamientos', 'Valor': treatments.length },
      { 'Concepto': 'Total Reacciones Adversas', 'Valor': adverseReactions.length },
      { 'Concepto': 'Grupos Farmacológicos', 'Valor': new Set(medicines.map(m => m.pharmacologicalGroup || m.pharmacologicalAction?.split(',')[0].trim()).filter(Boolean)).size },
      { 'Concepto': 'Fecha del Reporte', 'Valor': new Date().toLocaleDateString('es-ES') },
      { 'Concepto': 'Centro', 'Valor': 'PharmaLocal - Sistema de Gestión Farmacéutica' }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
    
    // Sheet 2: Inventario de Medicamentos
    const inventoryData = medicines.map(m => ({
      'ID': m.id,
      'Nombre Comercial': m.comercialName,
      'Grupo Farmacológico': m.pharmacologicalGroup || '',
      'Principio Activo': m.activePrinciples || '',
      'Acción Farmacológica': m.pharmacologicalAction || '',
      'Instrucciones de Administración': m.administrationInstructions || '',
      'Instrucciones de Conservación': m.conservationInstructions || '',
      'Información Adicional': m.additionalInfo || '',
      'Fecha de Creación': new Date(m.createdAt).toLocaleDateString('es-ES')
    }));
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    wsInventory['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 25 },
      { wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventario');
    
    // Sheet 3: Pacientes
    const patientsData = patients.map(p => ({
      'ID': p.id,
      'Nombre Completo': p.fullName,
      'Cédula/DNI': p.cedula,
      'Fecha de Nacimiento': p.dateOfBirth,
      'Teléfono': p.phone || '',
      'Email': p.email || '',
      'Dirección': p.address || '',
      'Condiciones Médicas': p.medicalConditions || '',
      'Fecha de Creación': new Date(p.createdAt).toLocaleDateString('es-ES')
    }));
    const wsPatients = XLSX.utils.json_to_sheet(patientsData);
    wsPatients['!cols'] = [
      { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
      { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsPatients, 'Pacientes');
    
    // Sheet 4: Tratamientos
    const treatmentsData = treatments.map(t => {
      const patient = patients.find(p => p.id === t.patientId);
      const medicine = medicines.find(m => m.id === t.medicineId);
      return {
        'ID': t.id,
        'Paciente': patient?.fullName || 'Desconocido',
        'Medicamento': medicine?.comercialName || 'Desconocido',
        'Fecha de Inicio': t.startDate,
        'Fecha de Fin': t.endDate || '',
        'Estado': t.isActive ? 'Activo' : 'Inactivo',
        'Número de Dosis': t.doses.length,
        'Instrucciones Generales': t.generalInstructions || '',
        'Notas': t.notes || '',
        'Fecha de Creación': new Date(t.createdAt).toLocaleDateString('es-ES')
      };
    });
    const wsTreatments = XLSX.utils.json_to_sheet(treatmentsData);
    wsTreatments['!cols'] = [
      { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 },
      { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 30 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsTreatments, 'Tratamientos');
    
    // Sheet 5: Farmacovigilancia
    const sortedReactions = adverseReactions.sort((a, b) => {
      const severityOrder = { 'grave': 0, 'moderada': 1, 'leve': 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    const farmacovigilanciaData = sortedReactions.map(r => {
      const patient = patients.find(p => p.id === r.patientId);
      const medicine = medicines.find(m => m.id === r.medicineId);
      return {
        'Fecha': new Date(r.dateReported).toLocaleDateString('es-ES'),
        'Paciente': patient?.fullName || 'Desconocido',
        'Cédula': patient?.cedula || '',
        'Medicamento': medicine?.comercialName || 'Desconocido',
        'Principio Activo': medicine?.activePrinciples || '',
        'Síntoma': r.symptom,
        'Gravedad': r.severity.toUpperCase(),
        'Notas': r.notes || '',
        'Estado': r.status.charAt(0).toUpperCase() + r.status.slice(1),
        'Fecha de Registro': new Date(r.createdAt).toLocaleDateString('es-ES')
      };
    });
    
    if (farmacovigilanciaData.length > 0) {
      const wsFarmacovigilancia = XLSX.utils.json_to_sheet(farmacovigilanciaData);
      wsFarmacovigilancia['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
        { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 40 }, { wch: 12 }, { wch: 15 }
      ];
      
      // Apply styling to header row
      const range = XLSX.utils.decode_range(wsFarmacovigilancia['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!wsFarmacovigilancia[cellAddress]) continue;
        wsFarmacovigilancia[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: 'FF6B00' } },
          alignment: { horizontal: 'center', vertical: 'center' }
        };
      }
      
      // Apply conditional formatting to Gravedad column
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const gravedadCell = XLSX.utils.encode_cell({ r: row, c: 6 }); // Column G (Gravedad)
        if (wsFarmacovigilancia[gravedadCell]) {
          const severity = wsFarmacovigilancia[gravedadCell].v;
          if (severity === 'GRAVE') {
            wsFarmacovigilancia[gravedadCell].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: 'DC2626' } },
              alignment: { horizontal: 'center' }
            };
          } else if (severity === 'MODERADA') {
            wsFarmacovigilancia[gravedadCell].s = {
              font: { bold: true, color: { rgb: '000000' } },
              fill: { fgColor: { rgb: 'FBBF24' } },
              alignment: { horizontal: 'center' }
            };
          } else if (severity === 'LEVE') {
            wsFarmacovigilancia[gravedadCell].s = {
              font: { bold: true, color: { rgb: 'FFFFFF' } },
              fill: { fgColor: { rgb: '10B981' } },
              alignment: { horizontal: 'center' }
            };
          }
        }
      }
      
      XLSX.utils.book_append_sheet(wb, wsFarmacovigilancia, 'Farmacovigilancia');
    }
    
    XLSX.writeFile(wb, 'reporte_completo_pharmalocal.xlsx');
    showMessage('success', 'Reporte completo exportado a Excel correctamente');
  };

  return (
    <div className="p-8 surface-page min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Configuración</h1>
        <p className="text-secondary mt-2">Administra los datos del sistema</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'badge-success border '
              : 'badge-danger border '
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-inverse" />
          ) : (
            <AlertCircle className="w-5 h-5 text-inverse" />
          )}
          <p
            className={`font-medium ${
              message.type === 'success' ? 'text-inverse' : 'text-inverse'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="surface-card rounded-lg shadow-themed-md p-6 border-l-4 border-default">
          <p className="text-secondary text-sm font-medium">Pacientes</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.patients}</p>
        </div>
        <div className="surface-card rounded-lg shadow-themed-md p-6 border-l-4 border-default">
          <p className="text-secondary text-sm font-medium">Medicamentos</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.medicines}</p>
        </div>
        <div className="surface-card rounded-lg shadow-themed-md p-6 border-l-4 border-default">
          <p className="text-secondary text-sm font-medium">Tratamientos</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.treatments}</p>
        </div>
        <div className="surface-card rounded-lg shadow-themed-md p-6 border-l-4 border-orange-600">
          <p className="text-secondary text-sm font-medium">Reacciones Adversas</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{stats.adverseReactions}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-card rounded-lg shadow-themed-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 button-primary rounded-lg">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary">Exportar Datos (Backup)</h2>
              <p className="text-secondary text-sm mt-1">
                Descarga todos tus datos en un archivo JSON seguro que puedes guardar y restaurar después.
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full button-primary text-inverse px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar Backup
          </button>
        </div>

        <div className="surface-card rounded-lg shadow-themed-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 badge-success rounded-lg">
              <Upload className="w-6 h-6 text-inverse" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary">Importar Datos (Restaurar)</h2>
              <p className="text-secondary text-sm mt-1">
                Restaura datos desde un archivo JSON de backup anterior. Esto reemplazará todos los datos actuales.
              </p>
            </div>
          </div>
          <button
            onClick={handleImport}
            className="w-full button-success text-inverse px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Cargar Backup
          </button>
        </div>

        <div className="surface-card rounded-lg shadow-themed-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 badge-primary rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary">Exportar Reporte Completo (.xlsx)</h2>
              <p className="text-secondary text-sm mt-1">
                Exporta todos los datos del sistema a un archivo Excel profesional con múltiples hojas: Resumen, Inventario, Pacientes, Tratamientos y Farmacovigilancia (RAM).
              </p>
            </div>
          </div>
          <button
            onClick={exportFullReportToExcel}
            className="w-full button-primary text-inverse px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Descargar Reporte Completo (.xlsx)
          </button>
        </div>

        <div className="surface-card rounded-lg shadow-themed-md p-6 border-l-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 button-danger rounded-lg">
              <Trash2 className="w-6 h-6 text-inverse" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-primary">Eliminar Todos los Datos</h2>
              <p className="text-secondary text-sm mt-1">
                Elimina permanentemente TODOS los datos del sistema (pacientes, medicamentos y tratamientos). Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full button-danger text-inverse px-4 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar Todos los Datos
            </button>
          ) : (
            <div className="space-y-3 p-4 badge-danger rounded-lg border-2">
              <p className="font-semibold text-inverse">
                ⚠️ ¿Estás COMPLETAMENTE SEGURO?
              </p>
              <p className="text-sm text-red-800">
                Esto eliminará PERMANENTEMENTE:
              </p>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                <li>{stats.patients} pacientes</li>
                <li>{stats.medicines} medicamentos</li>
                <li>{stats.treatments} tratamientos</li>
                <li>{stats.adverseReactions} reacciones adversas</li>
              </ul>
              <p className="text-sm text-red-800 font-semibold">
                Esta acción NO se puede deshacer.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 surface-card text-primary rounded-lg surface-hover transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 px-4 py-2 button-danger text-inverse rounded-lg transition-colors font-medium"
                >
                  Sí, Eliminar Todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 surface-card rounded-lg p-6 border border-default">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información del Sistema</h3>
        <div className="text-sm text-blue-900 space-y-2">
          <p><strong>Aplicación:</strong> PharmaLocal v2.0.0 - Farmacovigilancia</p>
          <p><strong>Almacenamiento:</strong> IndexedDB del navegador (Offline-First)</p>
          <p><strong>Datos almacenados:</strong> {stats.patients} pacientes, {stats.medicines} medicamentos, {stats.treatments} tratamientos, {stats.adverseReactions} reacciones adversas</p>
          <p><strong>Tipo de datos:</strong> Todo se almacena localmente en tu navegador. No se envía a ningún servidor.</p>
        </div>
      </div>
    </div>
  );
};
