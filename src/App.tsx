import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Medicines } from './components/Medicines';
import { Treatments } from './components/Treatments';
import { Settings } from './components/Settings';
import { TreatmentDashboard } from './components/TreatmentDashboard';

type ViewType = 'dashboard' | 'patients' | 'medicines' | 'treatments' | 'settings' | 'treatment-dashboard';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={(view) => setCurrentView(view as ViewType)} />;
      case 'patients':
        return <Patients />;
      case 'medicines':
        return <Medicines />;
      case 'treatments':
        return <Treatments />;
      case 'settings':
        return <Settings />;
      case 'treatment-dashboard':
        return <TreatmentDashboard />;
      default:
        return <Dashboard onNavigate={(view) => setCurrentView(view as ViewType)} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as ViewType)} />
      <main className="flex-1 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
