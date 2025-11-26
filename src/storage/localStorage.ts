import { AppData, Medicine, Patient, Treatment } from '../types';

const STORAGE_KEY = 'pharmalocal_data';
const CURRENT_VERSION = 2;

const defaultData: AppData = {
  medicines: [],
  patients: [],
  treatments: [],
  adverseReactions: [],
  version: CURRENT_VERSION,
};

export const StorageService = {
  getData: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultData;
      const parsed = JSON.parse(data);
      return { ...defaultData, ...parsed };
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return defaultData;
    }
  },

  saveData: (data: AppData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  // Medicines
  addMedicine: (medicine: Medicine): void => {
    const data = StorageService.getData();
    data.medicines.push(medicine);
    StorageService.saveData(data);
  },

  updateMedicine: (id: string, medicine: Partial<Medicine>): void => {
    const data = StorageService.getData();
    const index = data.medicines.findIndex(m => m.id === id);
    if (index !== -1) {
      data.medicines[index] = { ...data.medicines[index], ...medicine };
      StorageService.saveData(data);
    }
  },

  deleteMedicine: (id: string): void => {
    const data = StorageService.getData();
    data.medicines = data.medicines.filter(m => m.id !== id);
    StorageService.saveData(data);
  },

  getMedicines: (): Medicine[] => {
    return StorageService.getData().medicines;
  },

  getMedicineById: (id: string): Medicine | undefined => {
    return StorageService.getData().medicines.find(m => m.id === id);
  },

  // Patients
  addPatient: (patient: Patient): void => {
    const data = StorageService.getData();
    data.patients.push(patient);
    StorageService.saveData(data);
  },

  updatePatient: (id: string, patient: Partial<Patient>): void => {
    const data = StorageService.getData();
    const index = data.patients.findIndex(p => p.id === id);
    if (index !== -1) {
      data.patients[index] = { ...data.patients[index], ...patient };
      StorageService.saveData(data);
    }
  },

  deletePatient: (id: string): void => {
    const data = StorageService.getData();
    data.patients = data.patients.filter(p => p.id !== id);
    StorageService.saveData(data);
  },

  getPatients: (): Patient[] => {
    return StorageService.getData().patients;
  },

  getPatientById: (id: string): Patient | undefined => {
    return StorageService.getData().patients.find(p => p.id === id);
  },

  // Treatments
  addTreatment: (treatment: Treatment): void => {
    const data = StorageService.getData();
    data.treatments.push(treatment);
    StorageService.saveData(data);
  },

  updateTreatment: (id: string, treatment: Partial<Treatment>): void => {
    const data = StorageService.getData();
    const index = data.treatments.findIndex(t => t.id === id);
    if (index !== -1) {
      data.treatments[index] = { ...data.treatments[index], ...treatment };
      StorageService.saveData(data);
    }
  },

  deleteTreatment: (id: string): void => {
    const data = StorageService.getData();
    data.treatments = data.treatments.filter(t => t.id !== id);
    StorageService.saveData(data);
  },

  getTreatments: (): Treatment[] => {
    return StorageService.getData().treatments;
  },

  getTreatmentById: (id: string): Treatment | undefined => {
    return StorageService.getData().treatments.find(t => t.id === id);
  },

  getTreatmentsByPatient: (patientId: string): Treatment[] => {
    return StorageService.getData().treatments.filter(t => t.patientId === patientId);
  },

  // Bulk operations
  exportData: (): string => {
    const data = StorageService.getData();
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString) as AppData;
      if (!data.medicines || !data.patients || !data.treatments) {
        return false;
      }
      StorageService.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  clearAllData: (): void => {
    StorageService.saveData(defaultData);
  },
};
