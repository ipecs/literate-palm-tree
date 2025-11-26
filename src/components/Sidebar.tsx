import {
  Pill,
  Users,
  Settings,
  Home,
  Sun,
  Moon,
  Contrast,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { theme, cycleTheme } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'medicines', label: 'Medicamentos', icon: Pill },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      case 'high-contrast': return Contrast;
      default: return Sun;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'high-contrast': return 'Alto Contraste';
      default: return 'Claro';
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <aside className="w-64 surface-sidebar text-inverse shadow-themed-lg flex flex-col">
      <div className="p-6 border-b border-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full surface-sidebar-active flex items-center justify-center">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-sidebar">PharmaLocal</h1>
            <p className="text-xs text-sidebar-muted">Gestión Farmacéutica</p>
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
                      ? 'surface-sidebar-active text-sidebar'
                      : 'text-sidebar-muted surface-sidebar-hover'
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

      <div className="p-4 border-t border-sidebar">
        <button
          onClick={cycleTheme}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-muted surface-sidebar-hover transition-colors mb-3"
          title="Cambiar tema"
        >
          <ThemeIcon className="w-5 h-5" />
          <span className="font-medium text-sm">{getThemeLabel()}</span>
        </button>
        <p className="text-xs text-sidebar-muted px-4">v1.0.0</p>
      </div>
    </aside>
  );
};
