export interface Medicine {
  id: string;
  comercialName: string;
  activePrinciples?: string;
  pharmacologicalGroup?: string;
  pharmacologicalAction?: string;
  administrationInstructions?: string;
  conservationInstructions?: string;
  additionalInfo?: string;
  imageUrl?: string;
  iconType?: 'pill' | 'syrup' | 'injection' | 'capsule' | 'cream';
  createdAt: number;
}

export interface Patient {
  id: string;
  fullName: string;
  cedula: string;
  dateOfBirth: string;
  phone?: string;
  email?: string;
  address?: string;
  medicalConditions?: string;
  createdAt: number;
}

export interface TreatmentDose {
  medicineId: string;
  time: string;
  dosage: string;
  specificInstructions?: string;
}

export interface TimelineScheduleEntry {
  medicineId: string;
  hours: number[];
  instructions?: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  medicineId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  doses: TreatmentDose[];
  generalInstructions?: string;
  notes?: string;
  createdAt: number;
}

export interface AdverseReaction {
  id: string;
  patientId: string;
  medicineId: string;
  symptom: string;
  severity: 'leve' | 'moderada' | 'grave';
  dateReported: number;
  notes?: string;
  status: 'pendiente' | 'revisado' | 'reportado';
  createdAt: number;
}

export interface AppData {
  medicines: Medicine[];
  patients: Patient[];
  treatments: Treatment[];
  adverseReactions: AdverseReaction[];
  version: number;
}
