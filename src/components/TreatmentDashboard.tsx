import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Clock, Pill, FileText, Download, ChevronRight, Check, X, Edit2, Trash2, Printer, Package, Activity, Database } from 'lucide-react';
import { StorageService } from '../storage/localStorage';
import { Medicine } from '../types';
import * as XLSX from 'xlsx';

interface SelectedMedicine {
  medicine: Medicine;
  selected: boolean;
}

interface DoseSchedule {
  timeSlot: string;
  medicines: Array<{
    medicine: Medicine;
    dosage: string;
    instructions: string;
  }>;
}

export const TreatmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'selection' | 'information' | 'calendar' | 'report' | 'database'>('dashboard');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);
  const [patientName, setPatientName] = useState('');
  const [doseSchedule, setDoseSchedule] = useState<DoseSchedule[]>([
    { timeSlot: 'Desayuno (07:00-09:00)', medicines: [] },
    { timeSlot: 'Comida (12:00-14:00)', medicines: [] },
    { timeSlot: 'Cena (18:00-20:00)', medicines: [] },
    { timeSlot: 'Noche (21:00-23:00)', medicines: [] }
  ]);
  const [showReport, setShowReport] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [medicineFormData, setMedicineFormData] = useState({
    comercialName: '',
    activePrinciples: '',
    pharmacologicalAction: '',
    administrationInstructions: '',
    conservationInstructions: '',
    dispensationPlace: '',
    additionalInfo: '',
    imageUrl: '',
    iconType: 'pill' as 'pill' | 'syrup' | 'injection' | 'capsule' | 'cream'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMedicines(StorageService.getMedicines());
  };

  const getLastBackupDate = () => {
    const backup = localStorage.getItem('pharmalocal_last_backup');
    return backup ? new Date(backup).toLocaleDateString('es-ES') : 'No hay copias';
  };

  const getTotalPharmacologicalGroups = () => {
    const groups = new Set(medicines.map(m => m.pharmacologicalAction.split(',')[0].trim()));
    return groups.size;
  };

  const filteredMedicines = medicines.filter(m =>
    m.comercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.activePrinciples.toLowerCase().includes(searchTerm.toLowerCase())
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

  const addMedicineToSchedule = (medicine: Medicine, timeSlot: string) => {
    setDoseSchedule(prev => prev.map(slot => {
      if (slot.timeSlot === timeSlot) {
        return {
          ...slot,
          medicines: [...slot.medicines, {
            medicine,
            dosage: '1 unidad',
            instructions: ''
          }]
        };
      }
      return slot;
    }));
  };

  const updateScheduleItem = (timeSlot: string, medicineId: string, field: 'dosage' | 'instructions', value: string) => {
    setDoseSchedule(prev => prev.map(slot => {
      if (slot.timeSlot === timeSlot) {
        return {
          ...slot,
          medicines: slot.medicines.map(item => 
            item.medicine.id === medicineId 
              ? { ...item, [field]: value }
              : item
          )
        };
      }
      return slot;
    }));
  };

  const removeFromSchedule = (timeSlot: string, medicineId: string) => {
    setDoseSchedule(prev => prev.map(slot => {
      if (slot.timeSlot === timeSlot) {
        return {
          ...slot,
          medicines: slot.medicines.filter(item => item.medicine.id !== medicineId)
        };
      }
      return slot;
    }));
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
      'Principio Activo': m.activePrinciples,
      'Acción Farmacológica': m.pharmacologicalAction,
      'Administración': m.administrationInstructions,
      'Conservación': m.conservationInstructions,
      'Lugar de Dispensación': m.dispensationPlace,
      'Información Adicional': m.additionalInfo || '',
      'Fecha de Creación': new Date(m.createdAt).toLocaleDateString('es-ES')
    }));
    
    exportToExcel(formattedData, 'inventario_medicamentos', 'Inventario');
  };

  const saveMedicine = () => {
    if (!medicineFormData.comercialName || !medicineFormData.activePrinciples) {
      alert('Por favor completa los campos obligatorios');
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
      pharmacologicalAction: '',
      administrationInstructions: '',
      conservationInstructions: '',
      dispensationPlace: '',
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
      activePrinciples: medicine.activePrinciples,
      pharmacologicalAction: medicine.pharmacologicalAction,
      administrationInstructions: medicine.administrationInstructions,
      conservationInstructions: medicine.conservationInstructions,
      dispensationPlace: medicine.dispensationPlace,
      additionalInfo: medicine.additionalInfo,
      imageUrl: (medicine as Medicine & { imageUrl?: string }).imageUrl || '',
      iconType: (medicine as Medicine & { iconType?: string }).iconType || 'pill'
    });
    setShowMedicineModal(true);
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const printReport = () => {
    window.print();
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Medicamentos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{medicines.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500">
              <Pill className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Grupos Farmacológicos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getTotalPharmacologicalGroups()}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Última Copia de Seguridad</p>
              <p className="text-xl font-bold text-gray-900 mt-2">{getLastBackupDate()}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Información de Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Desarrollador</h3>
            <p className="text-gray-600">PharmaLocal Development Team</p>
            <p className="text-gray-600">Email: support@pharmalocal.com</p>
            <p className="text-gray-600">Teléfono: +1 234 567 890</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Consejos Rápidos</h3>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• Usa la pestaña "Tratamiento" para seleccionar medicamentos</li>
              <li>• Planifica dosis en el "Calendario"</li>
              <li>• Genera informes profesionales para imprimir</li>
              <li>• Exporta datos a Excel para análisis avanzados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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
                      <span className="text-2xl">{getMedicineIcon((medicine as Medicine & { iconType?: string }).iconType || 'pill')}</span>
                      <h3 className="font-semibold text-gray-900">{medicine.comercialName}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{medicine.activePrinciples}</p>
                    <p className="text-xs text-gray-500">{medicine.pharmacologicalAction.substring(0, 50)}...</p>
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
      const group = medicine.pharmacologicalAction.split(',')[0].trim();
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
                        <span className="text-2xl">{getMedicineIcon((medicine as Medicine & { iconType?: string }).iconType || 'pill')}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{medicine.comercialName}</h4>
                          <p className="text-sm text-gray-600">{medicine.activePrinciples}</p>
                          <p className="text-xs text-gray-500 mt-1">{medicine.pharmacologicalAction}</p>
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

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Nombre del Paciente
          </label>
          <input
            type="text"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
            placeholder="Ingrese el nombre del paciente"
          />
        </div>

        <div className="space-y-4">
          {doseSchedule.map((slot, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {slot.timeSlot}
              </h3>
              
              <div className="mb-3">
                <select
                  onChange={(e) => {
                    const medicine = medicines.find(m => m.id === (e.target as HTMLSelectElement).value);
                    if (medicine) {
                      addMedicineToSchedule(medicine, slot.timeSlot);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  value=""
                >
                  <option value="">Añadir medicamento...</option>
                  {selectedMedicines.map(item => (
                    <option key={item.medicine.id} value={item.medicine.id}>
                      {item.medicine.comercialName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {slot.medicines.map((item, medIndex) => (
                  <div key={medIndex} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-lg">{getMedicineIcon((item.medicine as Medicine & { iconType?: string }).iconType || 'pill')}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.medicine.comercialName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => updateScheduleItem(slot.timeSlot, item.medicine.id, 'dosage', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-24"
                          placeholder="Dosis"
                        />
                        <input
                          type="text"
                          value={item.instructions}
                          onChange={(e) => updateScheduleItem(slot.timeSlot, item.medicine.id, 'instructions', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded text-sm flex-1"
                          placeholder="Instrucciones específicas (ej: Triturar, Con comida)"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromSchedule(slot.timeSlot, item.medicine.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              <button
                onClick={printReport}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar PDF
              </button>
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
                {doseSchedule.filter(slot => slot.medicines.length > 0).map((slot, index) => (
                  <div key={index} className="border-2 border-clinical-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg text-clinical-700 mb-3">{slot.timeSlot}</h3>
                    <div className="space-y-2">
                      {slot.medicines.map((item, medIndex) => (
                        <div key={medIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{getMedicineIcon((item.medicine as Medicine & { iconType?: string }).iconType || 'pill')}</span>
                            <div>
                              <p className="font-semibold text-gray-900">{item.medicine.comercialName}</p>
                              <p className="text-sm text-gray-600">{item.medicine.activePrinciples}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{item.dosage}</p>
                            {item.instructions && (
                              <p className="text-sm text-gray-600">{item.instructions}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-clinical-600 pt-4">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="font-semibold text-amber-900 mb-2">ADVERTENCIAS IMPORTANTES</p>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Siga estrictamente las dosis y horarios indicados</li>
                  <li>• No suspenda el tratamiento sin consulta médica</li>
                  <li>• Consulte al profesional de salud ante cualquier reacción adversa</li>
                  <li>• Mantenga los medicamentos fuera del alcance de niños</li>
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
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Principio Activo</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Acción Farmacológica</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Administración</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Conservación</th>
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(medicine => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">
                    <span className="text-2xl">{getMedicineIcon((medicine as Medicine & { iconType?: string }).iconType || 'pill')}</span>
                  </td>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{medicine.comercialName}</td>
                  <td className="border border-gray-200 px-4 py-2">{medicine.activePrinciples}</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.pharmacologicalAction.substring(0, 50)}...</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.administrationInstructions.substring(0, 30)}...</td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">{medicine.conservationInstructions.substring(0, 30)}...</td>
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tratamiento</h1>
        <p className="text-gray-600 mt-2">Planificación y gestión de tratamientos farmacológicos</p>
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
                  Principios Activos *
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
                  Acción Farmacológica *
                </label>
                <textarea
                  value={medicineFormData.pharmacologicalAction}
                  onChange={e => setMedicineFormData({ ...medicineFormData, pharmacologicalAction: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de Administración *
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
                  Instrucciones de Conservación *
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
                  Lugar de Dispensación *
                </label>
                <input
                  type="text"
                  value={medicineFormData.dispensationPlace}
                  onChange={e => setMedicineFormData({ ...medicineFormData, dispensationPlace: e.target.value })}
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