import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, ChevronDown, AlertTriangle } from 'lucide-react';
import { StorageService } from '../storage/db';
import { Patient, Treatment, Medicine, AdverseReaction } from '../types';

export const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    medicalConditions: '',
  });
  const [showRAMModal, setShowRAMModal] = useState(false);
  const [ramPatientId, setRamPatientId] = useState<string | null>(null);
  const [ramFormData, setRamFormData] = useState({
    medicineId: '',
    symptom: '',
    severity: 'leve' as 'leve' | 'moderada' | 'grave',
    notes: '',
  });

  const loadPatients = async () => {
    const data = await StorageService.getPatients();
    setPatients(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  const loadMedicines = async () => {
    const data = await StorageService.getMedicines();
    setMedicines(data.sort((a, b) => a.comercialName.localeCompare(b.comercialName)));
  };

  useEffect(() => {
    loadPatients();
    loadMedicines();
  }, []);

  const resetForm = () => {
    setFormData({
      fullName: '',
      cedula: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      address: '',
      medicalConditions: '',
    });
    setEditingId(null);
  };

  const handleOpenModal = (patient?: Patient) => {
    if (patient) {
      setFormData({
        fullName: patient.fullName,
        cedula: patient.cedula,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        medicalConditions: patient.medicalConditions || '',
      });
      setEditingId(patient.id);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.fullName || !formData.cedula || !formData.dateOfBirth) {
      alert('Por favor completa los campos obligatorios: Nombre, Cédula y Fecha de Nacimiento');
      return;
    }

    if (editingId) {
      await StorageService.updatePatient(editingId, formData);
    } else {
      const newPatient: Patient = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
      };
      await StorageService.addPatient(newPatient);
    }

    await loadPatients();
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este paciente?')) {
      await StorageService.deletePatient(id);
      await loadPatients();
    }
  };

  const handleOpenRAMModal = (patientId: string) => {
    setRamPatientId(patientId);
    setRamFormData({
      medicineId: '',
      symptom: '',
      severity: 'leve',
      notes: '',
    });
    setShowRAMModal(true);
  };

  const handleCloseRAMModal = () => {
    setShowRAMModal(false);
    setRamPatientId(null);
    setRamFormData({
      medicineId: '',
      symptom: '',
      severity: 'leve',
      notes: '',
    });
  };

  const handleSaveRAM = async () => {
    if (!ramPatientId || !ramFormData.medicineId || !ramFormData.symptom) {
      alert('Por favor completa los campos obligatorios: Medicamento y Síntoma');
      return;
    }

    const newReaction: AdverseReaction = {
      id: Date.now().toString(),
      patientId: ramPatientId,
      medicineId: ramFormData.medicineId,
      symptom: ramFormData.symptom,
      severity: ramFormData.severity,
      dateReported: Date.now(),
      notes: ramFormData.notes || undefined,
      status: 'pendiente',
      createdAt: Date.now(),
    };

    await StorageService.addAdverseReaction(newReaction);
    handleCloseRAMModal();
    alert('Reacción adversa reportada exitosamente');
  };

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedula.includes(searchTerm)
  );

  const PatientTreatments = ({ patientId }: { patientId: string }) => {
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    useEffect(() => {
      const loadData = async () => {
        const treatmentData = await StorageService.getTreatmentsByPatient(patientId);
        const medicineData = await StorageService.getMedicines();
        setTreatments(treatmentData);
        setMedicines(medicineData);
      };
      loadData();
    }, [patientId]);

    if (treatments.length === 0) {
      return <p className="text-muted text-sm">No hay tratamientos asignados</p>;
    }

    return (
      <div className="space-y-2">
        {treatments.map(treatment => {
          const medicine = medicines.find(m => m.id === treatment.medicineId);
          return (
            <div
              key={treatment.id}
              className={`text-sm p-2 rounded border ${treatment.isActive ? 'badge-success' : 'surface-card border-default'}`}
            >
              <p className="font-medium text-primary">
                {medicine?.comercialName} {!treatment.isActive && '(Inactivo)'}
              </p>
              <p className="text-muted text-xs">
                {treatment.doses.length} {treatment.doses.length === 1 ? 'dosis' : 'dosis'} al día
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  const PatientAdverseReactions = ({ patientId }: { patientId: string }) => {
    const [reactions, setReactions] = useState<AdverseReaction[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);

    useEffect(() => {
      const loadData = async () => {
        const reactionData = await StorageService.getAdverseReactionsByPatient(patientId);
        const medicineData = await StorageService.getMedicines();
        setReactions(reactionData.sort((a, b) => b.dateReported - a.dateReported));
        setMedicines(medicineData);
      };
      loadData();
    }, [patientId]);

    if (reactions.length === 0) {
      return <p className="text-muted text-sm">No hay reacciones adversas reportadas</p>;
    }

    const getSeverityIndicator = (severity: 'leve' | 'moderada' | 'grave') => {
      switch (severity) {
        case 'grave':
          return '🔴';
        case 'moderada':
          return '🟡';
        case 'leve':
          return '🟢';
      }
    };

    const getSeverityBadgeClass = (severity: 'leve' | 'moderada' | 'grave') => {
      switch (severity) {
        case 'grave':
          return 'badge-danger';
        case 'moderada':
          return 'badge-warning';
        case 'leve':
          return 'badge-success';
      }
    };

    return (
      <div className="space-y-2">
        {reactions.map(reaction => {
          const medicine = medicines.find(m => m.id === reaction.medicineId);
          return (
            <div
              key={reaction.id}
              className="text-sm p-3 rounded border border-default surface-card"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-primary flex items-center gap-2">
                    {getSeverityIndicator(reaction.severity)} {medicine?.comercialName || 'Medicamento desconocido'}
                  </p>
                  <p className="text-secondary text-xs mt-1">
                    <strong>Síntoma:</strong> {reaction.symptom}
                  </p>
                  {reaction.notes && (
                    <p className="text-muted text-xs mt-1">
                      <strong>Notas:</strong> {reaction.notes}
                    </p>
                  )}
                  <p className="text-muted text-xs mt-1">
                    {new Date(reaction.dateReported).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`${getSeverityBadgeClass(reaction.severity)} text-xs px-2 py-1 rounded`}>
                    {reaction.severity.charAt(0).toUpperCase() + reaction.severity.slice(1)}
                  </span>
                  <span className="badge-primary text-xs px-2 py-1 rounded">
                    {reaction.status.charAt(0).toUpperCase() + reaction.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 surface-page min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Gestión de Pacientes</h1>
        <p className="text-secondary mt-2">Registra y administra los datos de los pacientes</p>
      </div>

      <div className="surface-card rounded-lg shadow-themed-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 button-primary px-6 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Nuevo Paciente
          </button>
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="surface-card rounded-lg shadow-themed-md p-12 text-center">
          <p className="text-muted">No hay pacientes registrados. ¡Crea uno nuevo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="surface-card rounded-lg shadow-themed-md overflow-hidden">
              <div
                className="p-6 cursor-pointer surface-hover transition-colors"
                onClick={() => setExpandedId(expandedId === patient.id ? null : patient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-primary">{patient.fullName}</h3>
                    <p className="text-sm text-secondary">Cédula: {patient.cedula}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted transition-transform ${
                      expandedId === patient.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {expandedId === patient.id && (
                <div className="border-t border-default p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-secondary">Fecha de Nacimiento</p>
                      <p className="font-medium text-primary">{patient.dateOfBirth}</p>
                    </div>
                    {patient.phone && (
                      <div>
                        <p className="text-sm text-secondary">Teléfono</p>
                        <p className="font-medium text-primary">{patient.phone}</p>
                      </div>
                    )}
                    {patient.email && (
                      <div>
                        <p className="text-sm text-secondary">Email</p>
                        <p className="font-medium text-primary">{patient.email}</p>
                      </div>
                    )}
                    {patient.address && (
                      <div>
                        <p className="text-sm text-secondary">Dirección</p>
                        <p className="font-medium text-primary">{patient.address}</p>
                      </div>
                    )}
                  </div>

                  {patient.medicalConditions && (
                    <div>
                      <p className="text-sm text-secondary">Condiciones Médicas</p>
                      <p className="font-medium text-primary">{patient.medicalConditions}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-primary mb-3">Tratamientos Asignados</h4>
                    <PatientTreatments patientId={patient.id} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mb-3">Reacciones Adversas a Medicamentos (RAM)</h4>
                    <PatientAdverseReactions patientId={patient.id} />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t border-default">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRAMModal(patient.id);
                      }}
                      className="flex items-center justify-center gap-2 w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      aria-label="Reportar reacción adversa"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Reportar Reacción Adversa
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleOpenModal(patient)}
                        className="flex items-center gap-2 flex-1 button-primary px-4 py-2 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(patient.id)}
                        className="flex items-center gap-2 flex-1 button-danger px-4 py-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="surface-card rounded-lg shadow-themed-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 surface-card border-b border-default p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">
                {editingId ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 surface-hover rounded-lg">
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Cédula / DNI *
                  </label>
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                    className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Condiciones Médicas
                </label>
                <textarea
                  value={formData.medicalConditions}
                  onChange={e => setFormData({ ...formData, medicalConditions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sticky bottom-0 surface-card border-t border-default p-6 flex gap-3">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-default rounded-lg text-primary surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 button-primary px-4 py-2 rounded-lg"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showRAMModal && ramPatientId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="surface-card rounded-lg shadow-themed-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 surface-card border-b border-default p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-primary">
                  Reportar Reacción Adversa
                </h2>
              </div>
              <button onClick={handleCloseRAMModal} className="p-1 surface-hover rounded-lg">
                <X className="w-6 h-6 text-primary" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                <p className="text-sm text-orange-800">
                  <strong>Farmacovigilancia:</strong> Registra reacciones adversas para mejorar la seguridad del paciente y cumplir con regulaciones sanitarias.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Medicamento Sospechoso *
                </label>
                <select
                  value={ramFormData.medicineId}
                  onChange={e => setRamFormData({ ...ramFormData, medicineId: e.target.value })}
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  aria-label="Seleccionar medicamento sospechoso"
                >
                  <option value="">Seleccionar medicamento...</option>
                  {medicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.comercialName}
                      {medicine.activePrinciples && ` (${medicine.activePrinciples})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Síntoma Reportado *
                </label>
                <input
                  type="text"
                  value={ramFormData.symptom}
                  onChange={e => setRamFormData({ ...ramFormData, symptom: e.target.value })}
                  placeholder="Ej: Náuseas, Mareos, Erupción cutánea..."
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  aria-label="Ingresar síntoma reportado"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Gravedad *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRamFormData({ ...ramFormData, severity: 'leve' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      ramFormData.severity === 'leve'
                        ? 'border-green-600 bg-green-50 text-green-900'
                        : 'border-default surface-card text-secondary hover:border-green-400'
                    }`}
                    aria-label="Seleccionar gravedad leve"
                  >
                    <div className="text-2xl mb-1">🟢</div>
                    <div className="font-semibold text-sm">Leve</div>
                    <div className="text-xs mt-1">Sin riesgo inmediato</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRamFormData({ ...ramFormData, severity: 'moderada' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      ramFormData.severity === 'moderada'
                        ? 'border-yellow-600 bg-yellow-50 text-yellow-900'
                        : 'border-default surface-card text-secondary hover:border-yellow-400'
                    }`}
                    aria-label="Seleccionar gravedad moderada"
                  >
                    <div className="text-2xl mb-1">🟡</div>
                    <div className="font-semibold text-sm">Moderada</div>
                    <div className="text-xs mt-1">Requiere atención</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRamFormData({ ...ramFormData, severity: 'grave' })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      ramFormData.severity === 'grave'
                        ? 'border-red-600 bg-red-50 text-red-900'
                        : 'border-default surface-card text-secondary hover:border-red-400'
                    }`}
                    aria-label="Seleccionar gravedad grave"
                  >
                    <div className="text-2xl mb-1">🔴</div>
                    <div className="font-semibold text-sm">Grave</div>
                    <div className="text-xs mt-1">Riesgo inmediato</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  value={ramFormData.notes}
                  onChange={e => setRamFormData({ ...ramFormData, notes: e.target.value })}
                  rows={4}
                  placeholder="Descripción detallada de la reacción, circunstancias, duración, tratamiento aplicado..."
                  className="w-full px-4 py-2 border border-default rounded-lg surface-card text-primary focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  aria-label="Ingresar notas adicionales"
                />
              </div>
            </div>

            <div className="sticky bottom-0 surface-card border-t border-default p-6 flex gap-3">
              <button
                onClick={handleCloseRAMModal}
                className="flex-1 px-4 py-2 border border-default rounded-lg text-primary surface-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRAM}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Guardar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
