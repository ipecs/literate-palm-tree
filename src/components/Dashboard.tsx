import { useEffect, useState } from 'react';
import { Users, Pill, Calendar, Activity } from 'lucide-react';
import { StorageService } from '../storage/localStorage';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    patients: 0,
    medicines: 0,
    activeTreatments: 0,
  });

  useEffect(() => {
    const patients = StorageService.getPatients();
    const medicines = StorageService.getMedicines();
    const treatments = StorageService.getTreatments();
    const activeTreatments = treatments.filter(t => t.isActive).length;

    setStats({
      patients: patients.length,
      medicines: medicines.length,
      activeTreatments,
    });
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('l-4', '')}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a PharmaLocal</h1>
        <p className="text-gray-600 mt-2">Sistema de Gestión de Atención Farmacéutica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Pacientes Registrados"
          value={stats.patients}
          color="border-blue-500"
        />
        <StatCard
          icon={Pill}
          label="Medicamentos en Inventario"
          value={stats.medicines}
          color="border-green-500"
        />
        <StatCard
          icon={Calendar}
          label="Tratamientos Activos"
          value={stats.activeTreatments}
          color="border-purple-500"
        />
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
