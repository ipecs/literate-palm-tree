import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Patients } from './components/Patients';
import { Medicines } from './components/Medicines';
import { Treatments } from './components/Treatments';
import { Settings } from './components/Settings';

type ViewType = 'dashboard' | 'patients' | 'medicines' | 'treatments' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <Patients />;
      case 'medicines':
        return <Medicines />;
      case 'treatments':
        return <Treatments />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
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
