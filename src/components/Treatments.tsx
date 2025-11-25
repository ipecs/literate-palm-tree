import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, ChevronDown, Printer } from 'lucide-react';
import { StorageService } from '../storage/localStorage';
import { Treatment, Patient, Medicine, TreatmentDose } from '../types';

export const Treatments = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    medicineId: '',
    startDate: '',
    endDate: '',
    isActive: true,
    doses: [] as TreatmentDose[],
    generalInstructions: '',
    notes: '',
  });

  const loadData = () => {
    const treatmentsData = StorageService.getTreatments();
    const patientsData = StorageService.getPatients();
    const medicinesData = StorageService.getMedicines();
    setTreatments(treatmentsData.sort((a, b) => b.createdAt - a.createdAt));
    setPatients(patientsData);
    setMedicines(medicinesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData({
      patientId: '',
      medicineId: '',
      startDate: '',
      endDate: '',
      isActive: true,
      doses: [],
      generalInstructions: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpenModal = (treatment?: Treatment) => {
    if (treatment) {
      setFormData({
        patientId: treatment.patientId,
        medicineId: treatment.medicineId,
        startDate: treatment.startDate,
        endDate: treatment.endDate || '',
        isActive: treatment.isActive,
        doses: JSON.parse(JSON.stringify(treatment.doses)),
        generalInstructions: treatment.generalInstructions || '',
        notes: treatment.notes || '',
      });
      setEditingId(treatment.id);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleAddDose = () => {
    setFormData({
      ...formData,
      doses: [
        ...formData.doses,
        { medicineId: formData.medicineId, time: '', dosage: '', specificInstructions: '' },
      ],
    });
  };

  const handleRemoveDose = (index: number) => {
    setFormData({
      ...formData,
      doses: formData.doses.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDose = (index: number, field: string, value: string) => {
    const newDoses = [...formData.doses];
    newDoses[index] = { ...newDoses[index], [field]: value };
    setFormData({ ...formData, doses: newDoses });
  };

  const handleSave = () => {
    if (!formData.patientId || !formData.medicineId || !formData.startDate || formData.doses.length === 0) {
      alert('Por favor completa todos los campos obligatorios y añade al menos una dosis');
      return;
    }

    if (editingId) {
      StorageService.updateTreatment(editingId, formData);
    } else {
      const newTreatment: Treatment = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
      };
      StorageService.addTreatment(newTreatment);
    }

    loadData();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este tratamiento?')) {
      StorageService.deleteTreatment(id);
      loadData();
    }
  };

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.fullName || 'Desconocido';
  };

  const getMedicineName = (medicineId: string) => {
    return medicines.find(m => m.id === medicineId)?.comercialName || 'Desconocido';
  };

  const getMedicineData = (medicineId: string) => {
    return medicines.find(m => m.id === medicineId);
  };

  const filteredTreatments = treatments.filter(t => {
    const patientName = getPatientName(t.patientId).toLowerCase();
    const medicineName = getMedicineName(t.medicineId).toLowerCase();
    const term = searchTerm.toLowerCase();
    return patientName.includes(term) || medicineName.includes(term);
  });

  const TreatmentReport = ({ treatmentId }: { treatmentId: string }) => {
    const treatment = StorageService.getTreatmentById(treatmentId);
    if (!treatment) return null;

    const patient = StorageService.getPatientById(treatment.patientId);
    const medicine = getMedicineData(treatment.medicineId);
    if (!patient || !medicine) return null;

    return (
      <div id={`print-${treatmentId}`} className="print-container bg-white">
        <div className="text-center mb-8 pb-4 border-b-2 border-clinical-700">
          <h1 className="text-3xl font-bold text-clinical-700">HOJA DE TRATAMIENTO</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión Farmacéutica PharmaLocal</p>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-600 font-semibold">PACIENTE</p>
              <p className="text-xl font-bold text-gray-900">{patient.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">CÉDULA / DNI</p>
              <p className="text-xl font-bold text-gray-900">{patient.cedula}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-600 font-semibold">FECHA DE NACIMIENTO</p>
              <p className="text-lg text-gray-900">{patient.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">INICIO DEL TRATAMIENTO</p>
              <p className="text-lg text-gray-900">{treatment.startDate}</p>
            </div>
          </div>

          {patient.phone && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold">TELÉFONO</p>
                <p className="text-lg text-gray-900">{patient.phone}</p>
              </div>
              {treatment.endDate && (
                <div>
                  <p className="text-xs text-gray-600 font-semibold">FECHA DE FINALIZACIÓN</p>
                  <p className="text-lg text-gray-900">{treatment.endDate}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-8 p-4 bg-clinical-50 border-l-4 border-clinical-600">
          <p className="text-sm font-bold text-clinical-900 mb-2">MEDICAMENTO PRESCRITO</p>
          <p className="text-2xl font-bold text-clinical-700 mb-4">{medicine.comercialName}</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700">Principios Activos</p>
              <p className="text-lg text-gray-900">{medicine.activePrinciples}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700">Acción Farmacológica</p>
              <p className="text-lg text-gray-900">{medicine.pharmacologicalAction}</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-clinical-600">PAUTA DE ADMINISTRACIÓN</h2>
          <div className="space-y-4">
            {treatment.doses.map((dose, idx) => (
              <div key={idx} className="p-4 border-2 border-clinical-200 rounded-lg bg-gray-50">
                <p className="text-2xl font-bold text-clinical-700 mb-2">{dose.time}</p>
                <p className="text-xl font-semibold text-gray-900">Dosis: {dose.dosage}</p>
                {dose.specificInstructions && (
                  <p className="text-lg text-gray-700 mt-2">Instrucciones: {dose.specificInstructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="text-sm font-semibold text-blue-900 mb-2">INSTRUCCIONES GENERALES DE ADMINISTRACIÓN</p>
            <p className="text-lg text-blue-900 whitespace-pre-wrap">{medicine.administrationInstructions}</p>
          </div>

          <div className="p-4 bg-amber-50 border-l-4 border-amber-500">
            <p className="text-sm font-semibold text-amber-900 mb-2">INSTRUCCIONES DE CONSERVACIÓN</p>
            <p className="text-lg text-amber-900 whitespace-pre-wrap">{medicine.conservationInstructions}</p>
          </div>

          {treatment.generalInstructions && (
            <div className="p-4 bg-green-50 border-l-4 border-green-500">
              <p className="text-sm font-semibold text-green-900 mb-2">NOTAS DEL TRATAMIENTO</p>
              <p className="text-lg text-green-900 whitespace-pre-wrap">{treatment.generalInstructions}</p>
            </div>
          )}
        </div>

        <div className="border-t-2 border-clinical-600 pt-4 mt-8">
          <p className="text-xs text-gray-600">
            Documento generado el {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    );
  };

  const handlePrint = (id: string) => {
    setPrintingId(id);
    setTimeout(() => {
      window.print();
      setPrintingId(null);
    }, 100);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Planificador de Tratamientos</h1>
        <p className="text-gray-600 mt-2">Asigna medicamentos a pacientes y define pautas horarias</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por paciente o medicamento..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-clinical-600 text-white px-6 py-2 rounded-lg hover:bg-clinical-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Tratamiento
          </button>
        </div>
      </div>

      {filteredTreatments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">No hay tratamientos registrados. ¡Crea uno nuevo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTreatments.map(treatment => (
            <div key={treatment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === treatment.id ? null : treatment.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{getPatientName(treatment.patientId)}</h3>
                    <p className="text-sm text-gray-600">Medicamento: {getMedicineName(treatment.medicineId)}</p>
                    <p className={`text-xs font-semibold mt-1 ${treatment.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                      {treatment.isActive ? '✓ Activo' : '○ Inactivo'}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === treatment.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {expandedId === treatment.id && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Inicio</p>
                      <p className="font-medium text-gray-900">{treatment.startDate}</p>
                    </div>
                    {treatment.endDate && (
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Finalización</p>
                        <p className="font-medium text-gray-900">{treatment.endDate}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Pauta de Administración</h4>
                    <div className="space-y-2">
                      {treatment.doses.map((dose, idx) => (
                        <div key={idx} className="p-3 bg-clinical-50 rounded-lg border border-clinical-200">
                          <p className="font-bold text-clinical-700">{dose.time}</p>
                          <p className="text-gray-900">Dosis: {dose.dosage}</p>
                          {dose.specificInstructions && (
                            <p className="text-sm text-gray-600 mt-1">Instrucciones: {dose.specificInstructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {treatment.generalInstructions && (
                    <div>
                      <p className="text-sm text-gray-600">Notas del Tratamiento</p>
                      <p className="font-medium text-gray-900">{treatment.generalInstructions}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handlePrint(treatment.id)}
                      className="flex items-center gap-2 flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </button>
                    <button
                      onClick={() => handleOpenModal(treatment)}
                      className="flex items-center gap-2 flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(treatment.id)}
                      className="flex items-center gap-2 flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {printingId && (
        <div className="hidden print:block">
          <TreatmentReport treatmentId={printingId} />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editar Tratamiento' : 'Nuevo Tratamiento'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Paciente *
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  >
                    <option value="">Selecciona un paciente</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Medicamento *
                  </label>
                  <select
                    value={formData.medicineId}
                    onChange={e => setFormData({ ...formData, medicineId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  >
                    <option value="">Selecciona un medicamento</option>
                    {medicines.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.comercialName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fecha de Finalización
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-gray-900">
                  Tratamiento Activo
                </label>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Pauta de Administración *</h3>
                  <button
                    onClick={handleAddDose}
                    className="text-sm bg-clinical-600 text-white px-3 py-1 rounded hover:bg-clinical-700 transition-colors"
                  >
                    + Añadir Dosis
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.doses.map((dose, idx) => (
                    <div key={idx} className="p-4 border border-gray-300 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Hora / Momento del Día *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 08:00, Desayuno, Mañana"
                            value={dose.time}
                            onChange={e => handleUpdateDose(idx, 'time', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-clinical-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Dosis *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: 1 comprimido, 600mg, 2 cápsulas"
                            value={dose.dosage}
                            onChange={e => handleUpdateDose(idx, 'dosage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-clinical-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Instrucciones Específicas (Opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Con agua, Después de comidas, Con leche"
                          value={dose.specificInstructions}
                          onChange={e => handleUpdateDose(idx, 'specificInstructions', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-clinical-600"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveDose(idx)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Eliminar dosis
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Notas del Tratamiento
                </label>
                <textarea
                  value={formData.generalInstructions}
                  onChange={e => setFormData({ ...formData, generalInstructions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Notas adicionales para el paciente o el profesional"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-clinical-600 text-white px-4 py-2 rounded-lg hover:bg-clinical-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
