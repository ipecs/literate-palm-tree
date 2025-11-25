import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Save, ChevronDown } from 'lucide-react';
import { StorageService } from '../storage/localStorage';
import { Medicine } from '../types';

export const Medicines = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    comercialName: '',
    activePrinciples: '',
    pharmacologicalGroup: '',
    administrationInstructions: '',
    conservationInstructions: '',
    additionalInfo: '',
  });

  const loadMedicines = () => {
    const data = StorageService.getMedicines();
    setMedicines(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const resetForm = () => {
    setFormData({
      comercialName: '',
      activePrinciples: '',
      pharmacologicalGroup: '',
      administrationInstructions: '',
      conservationInstructions: '',
      additionalInfo: '',
    });
    setEditingId(null);
  };

  const handleOpenModal = (medicine?: Medicine) => {
    if (medicine) {
      setFormData({
        comercialName: medicine.comercialName,
        activePrinciples: medicine.activePrinciples || '',
        pharmacologicalGroup: medicine.pharmacologicalGroup || '',
        administrationInstructions: medicine.administrationInstructions || '',
        conservationInstructions: medicine.conservationInstructions || '',
        additionalInfo: medicine.additionalInfo || '',
      });
      setEditingId(medicine.id);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSave = () => {
    if (!formData.comercialName) {
      alert('Por favor ingresa el nombre del medicamento');
      return;
    }

    if (editingId) {
      StorageService.updateMedicine(editingId, formData);
    } else {
      const newMedicine: Medicine = {
        id: Date.now().toString(),
        ...formData,
        createdAt: Date.now(),
      };
      StorageService.addMedicine(newMedicine);
    }

    loadMedicines();
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este medicamento?')) {
      StorageService.deleteMedicine(id);
      loadMedicines();
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.comercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.activePrinciples?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Medicamentos</h1>
        <p className="text-gray-600 mt-2">Administra el inventario de medicamentos</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar medicamento..."
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
            Nuevo Medicamento
          </button>
        </div>
      </div>

      {filteredMedicines.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600">No hay medicamentos registrados. ¡Crea uno nuevo!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedicines.map(medicine => (
            <div key={medicine.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === medicine.id ? null : medicine.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{medicine.comercialName}</h3>
                    <p className="text-sm text-gray-600">Principios activos: {medicine.activePrinciples}</p>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === medicine.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {expandedId === medicine.id && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Acción Farmacológica</p>
                    <p className="font-medium text-gray-900">{medicine.pharmacologicalAction}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Instrucciones de Administración</p>
                    <p className="font-medium text-gray-900">{medicine.administrationInstructions}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Instrucciones de Conservación</p>
                    <p className="font-medium text-gray-900">{medicine.conservationInstructions || '-'}</p>
                  </div>

                  {medicine.pharmacologicalGroup && (
                    <div>
                      <p className="text-sm text-gray-600">Grupo Farmacológico</p>
                      <p className="font-medium text-gray-900">{medicine.pharmacologicalGroup}</p>
                    </div>
                  )}

                  {medicine.additionalInfo && (
                    <div>
                      <p className="text-sm text-gray-600">Información Adicional</p>
                      <p className="font-medium text-gray-900">{medicine.additionalInfo}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleOpenModal(medicine)}
                      className="flex items-center gap-2 flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.id)}
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editar Medicamento' : 'Nuevo Medicamento'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre Comercial *
                </label>
                <input
                  type="text"
                  value={formData.comercialName}
                  onChange={e => setFormData({ ...formData, comercialName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Ibupirac 600mg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Principios Activos *
                </label>
                <input
                  type="text"
                  value={formData.activePrinciples}
                  onChange={e => setFormData({ ...formData, activePrinciples: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Ibuprofeno 600mg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Grupo Farmacológico
                </label>
                <input
                  type="text"
                  value={formData.pharmacologicalGroup}
                  onChange={e => setFormData({ ...formData, pharmacologicalGroup: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Analgésico, Antibiótico"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de Administración *
                </label>
                <textarea
                  value={formData.administrationInstructions}
                  onChange={e => setFormData({ ...formData, administrationInstructions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Oral, con agua, después de comidas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Instrucciones de Conservación *
                </label>
                <textarea
                  value={formData.conservationInstructions}
                  onChange={e => setFormData({ ...formData, conservationInstructions: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Ej: Mantener a temperatura entre 15-25°C"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Información Adicional
                </label>
                <textarea
                  value={formData.additionalInfo}
                  onChange={e => setFormData({ ...formData, additionalInfo: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-clinical-600 focus:border-transparent"
                  placeholder="Notas adicionales, contraindicaciones, etc."
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
