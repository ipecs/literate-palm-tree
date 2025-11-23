import React, { useState } from 'react';
import { Download, Upload, Trash2, AlertCircle, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { StorageService } from '../storage/localStorage';
import * as XLSX from 'xlsx-js-style';

export const Settings: React.FC = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = () => {
    const data = StorageService.exportData();
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
      reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
          const jsonString = event.target?.result as string;
          if (StorageService.importData(jsonString)) {
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

  const handleClearAllData = () => {
    StorageService.clearAllData();
    setShowDeleteConfirm(false);
    showMessage('success', 'Todos los datos han sido eliminados. Por favor recarga la página.');
    setTimeout(() => window.location.reload(), 2000);
  };

  const exportFullReportToExcel = () => {
    const medicines = StorageService.getMedicines();
    const patients = StorageService.getPatients();
    const treatments = StorageService.getTreatments();
    
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Resumen
    const summaryData = [
      { 'Concepto': 'Total Medicamentos', 'Valor': medicines.length },
      { 'Concepto': 'Total Pacientes', 'Valor': patients.length },
      { 'Concepto': 'Total Tratamientos', 'Valor': treatments.length },
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
    
    XLSX.writeFile(wb, 'reporte_completo_pharmalocal.xlsx');
    showMessage('success', 'Reporte completo exportado a Excel correctamente');
  };

  const stats = {
    patients: StorageService.getPatients().length,
    medicines: StorageService.getMedicines().length,
    treatments: StorageService.getTreatments().length,
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-2">Administra los datos del sistema</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <p
            className={`font-medium ${
              message.type === 'success' ? 'text-green-900' : 'text-red-900'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Pacientes</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.patients}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Medicamentos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.medicines}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Tratamientos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.treatments}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Exportar Datos (Backup)</h2>
              <p className="text-gray-600 text-sm mt-1">
                Descarga todos tus datos en un archivo JSON seguro que puedes guardar y restaurar después.
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar Backup
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Importar Datos (Restaurar)</h2>
              <p className="text-gray-600 text-sm mt-1">
                Restaura datos desde un archivo JSON de backup anterior. Esto reemplazará todos los datos actuales.
              </p>
            </div>
          </div>
          <button
            onClick={handleImport}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Cargar Backup
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Exportar Reporte Completo (.xlsx)</h2>
              <p className="text-gray-600 text-sm mt-1">
                Exporta todos los datos del sistema a un archivo Excel profesional con múltiples hojas: Resumen, Inventario, Pacientes y Tratamientos.
              </p>
            </div>
          </div>
          <button
            onClick={exportFullReportToExcel}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Descargar Reporte Completo (.xlsx)
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">Eliminar Todos los Datos</h2>
              <p className="text-gray-600 text-sm mt-1">
                Elimina permanentemente TODOS los datos del sistema (pacientes, medicamentos y tratamientos). Esta acción no se puede deshacer.
              </p>
            </div>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar Todos los Datos
            </button>
          ) : (
            <div className="space-y-3 p-4 bg-red-50 rounded-lg border-2 border-red-500">
              <p className="font-semibold text-red-900">
                ⚠️ ¿Estás COMPLETAMENTE SEGURO?
              </p>
              <p className="text-sm text-red-800">
                Esto eliminará PERMANENTEMENTE:
              </p>
              <ul className="text-sm text-red-800 space-y-1 ml-4 list-disc">
                <li>{stats.patients} pacientes</li>
                <li>{stats.medicines} medicamentos</li>
                <li>{stats.treatments} tratamientos</li>
              </ul>
              <p className="text-sm text-red-800 font-semibold">
                Esta acción NO se puede deshacer.
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sí, Eliminar Todo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información del Sistema</h3>
        <div className="text-sm text-blue-900 space-y-2">
          <p><strong>Aplicación:</strong> PharmaLocal v1.0.0</p>
          <p><strong>Almacenamiento:</strong> localStorage del navegador (Offline-First)</p>
          <p><strong>Datos almacenados:</strong> {stats.patients} pacientes, {stats.medicines} medicamentos, {stats.treatments} tratamientos</p>
          <p><strong>Tipo de datos:</strong> Todo se almacena localmente en tu navegador. No se envía a ningún servidor.</p>
        </div>
      </div>
    </div>
  );
};
