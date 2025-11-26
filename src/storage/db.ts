import Dexie, { Table } from 'dexie';
import { Medicine, Patient, Treatment, AppData } from '../types';

export class PharmaLocalDB extends Dexie {
  medicines!: Table<Medicine, string>;
  patients!: Table<Patient, string>;
  treatments!: Table<Treatment, string>;

  constructor() {
    super('PharmaLocalDB');
    
    this.version(1).stores({
      medicines: 'id, comercialName, pharmacologicalGroup, createdAt',
      patients: 'id, fullName, cedula, createdAt',
      treatments: 'id, patientId, medicineId, isActive, startDate, createdAt'
    });
  }
}

export const db = new PharmaLocalDB();

const MIGRATION_KEY = 'pharmalocal_migrated_to_indexeddb';
const OLD_STORAGE_KEY = 'pharmalocal_data';

export const migrateFromLocalStorage = async (): Promise<void> => {
  const migrated = localStorage.getItem(MIGRATION_KEY);
  if (migrated === 'true') {
    console.log('Data already migrated to IndexedDB');
    return;
  }

  try {
    const oldData = localStorage.getItem(OLD_STORAGE_KEY);
    if (!oldData) {
      console.log('No localStorage data to migrate');
      localStorage.setItem(MIGRATION_KEY, 'true');
      return;
    }

    const parsedData = JSON.parse(oldData) as AppData;
    
    console.log('Migrating data from localStorage to IndexedDB...');
    console.log(`Medicines: ${parsedData.medicines?.length || 0}`);
    console.log(`Patients: ${parsedData.patients?.length || 0}`);
    console.log(`Treatments: ${parsedData.treatments?.length || 0}`);

    if (parsedData.medicines?.length > 0) {
      await db.medicines.bulkPut(parsedData.medicines);
    }
    if (parsedData.patients?.length > 0) {
      await db.patients.bulkPut(parsedData.patients);
    }
    if (parsedData.treatments?.length > 0) {
      await db.treatments.bulkPut(parsedData.treatments);
    }

    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

export const StorageService = {
  // Medicines
  addMedicine: async (medicine: Medicine): Promise<void> => {
    await db.medicines.add(medicine);
  },

  updateMedicine: async (id: string, medicine: Partial<Medicine>): Promise<void> => {
    await db.medicines.update(id, medicine);
  },

  deleteMedicine: async (id: string): Promise<void> => {
    await db.medicines.delete(id);
  },

  getMedicines: async (): Promise<Medicine[]> => {
    return await db.medicines.toArray();
  },

  getMedicineById: async (id: string): Promise<Medicine | undefined> => {
    return await db.medicines.get(id);
  },

  // Patients
  addPatient: async (patient: Patient): Promise<void> => {
    await db.patients.add(patient);
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<void> => {
    await db.patients.update(id, patient);
  },

  deletePatient: async (id: string): Promise<void> => {
    await db.patients.delete(id);
  },

  getPatients: async (): Promise<Patient[]> => {
    return await db.patients.toArray();
  },

  getPatientById: async (id: string): Promise<Patient | undefined> => {
    return await db.patients.get(id);
  },

  // Treatments
  addTreatment: async (treatment: Treatment): Promise<void> => {
    await db.treatments.add(treatment);
  },

  updateTreatment: async (id: string, treatment: Partial<Treatment>): Promise<void> => {
    await db.treatments.update(id, treatment);
  },

  deleteTreatment: async (id: string): Promise<void> => {
    await db.treatments.delete(id);
  },

  getTreatments: async (): Promise<Treatment[]> => {
    return await db.treatments.toArray();
  },

  getTreatmentById: async (id: string): Promise<Treatment | undefined> => {
    return await db.treatments.get(id);
  },

  getTreatmentsByPatient: async (patientId: string): Promise<Treatment[]> => {
    return await db.treatments.where('patientId').equals(patientId).toArray();
  },

  // Bulk operations
  exportData: async (): Promise<string> => {
    const [medicines, patients, treatments] = await Promise.all([
      db.medicines.toArray(),
      db.patients.toArray(),
      db.treatments.toArray()
    ]);
    
    const data: AppData = {
      medicines,
      patients,
      treatments,
      version: 1
    };
    
    return JSON.stringify(data, null, 2);
  },

  importData: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString) as AppData;
      if (!data.medicines || !data.patients || !data.treatments) {
        return false;
      }

      await db.transaction('rw', db.medicines, db.patients, db.treatments, async () => {
        await db.medicines.clear();
        await db.patients.clear();
        await db.treatments.clear();

        if (data.medicines.length > 0) {
          await db.medicines.bulkPut(data.medicines);
        }
        if (data.patients.length > 0) {
          await db.patients.bulkPut(data.patients);
        }
        if (data.treatments.length > 0) {
          await db.treatments.bulkPut(data.treatments);
        }
      });

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  clearAllData: async (): Promise<void> => {
    await db.transaction('rw', db.medicines, db.patients, db.treatments, async () => {
      await db.medicines.clear();
      await db.patients.clear();
      await db.treatments.clear();
    });
  },
};
