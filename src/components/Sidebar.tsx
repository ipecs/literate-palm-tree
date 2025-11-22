import React from 'react';
import {
  Pill,
  Users,
  Calendar,
  Settings,
  Home,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'medicines', label: 'Medicamentos', icon: Pill },
    { id: 'treatments', label: 'Tratamientos', icon: Calendar },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-clinical-700 text-white shadow-lg flex flex-col">
      <div className="p-6 border-b border-clinical-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-clinical-400 flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">PharmaLocal</h1>
            <p className="text-xs text-clinical-200">Gestión Farmacéutica</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-clinical-500 text-white'
                      : 'text-clinical-100 hover:bg-clinical-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-clinical-600 text-xs text-clinical-200">
        <p>v1.0.0</p>
      </div>
    </aside>
  );
};
