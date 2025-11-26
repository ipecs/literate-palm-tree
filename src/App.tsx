import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Patients } from './components/Patients';
import { Medicines } from './components/Medicines';
import { Settings } from './components/Settings';
import { TreatmentDashboard } from './components/TreatmentDashboard';
import { migrateFromLocalStorage } from './storage/db';

type ViewType = 'dashboard' | 'patients' | 'medicines' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMigrating, setIsMigrating] = useState(true);

  useEffect(() => {
    const performMigration = async () => {
      try {
        await migrateFromLocalStorage();
      } catch (error) {
        console.error('Migration failed:', error);
      } finally {
        setIsMigrating(false);
      }
    };
    performMigration();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <TreatmentDashboard />;
      case 'patients':
        return <Patients />;
      case 'medicines':
        return <Medicines />;
      case 'settings':
        return <Settings />;
      default:
        return <TreatmentDashboard />;
    }
  };

  if (isMigrating) {
    return (
      <div className="flex h-screen surface-page items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinical-600 mx-auto"></div>
          </div>
          <p className="text-primary text-lg font-semibold">Migrando datos...</p>
          <p className="text-secondary text-sm mt-2">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen surface-page">
      <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as ViewType)} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
