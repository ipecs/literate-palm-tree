# PharmaLocal: Sistema de Gestión de Atención Farmacéutica

Una aplicación web profesional **Offline-First** para la gestión integral de atención farmacéutica. Diseñada para farmacéuticos y profesionales de la salud con persistencia en **IndexedDB** escalable a más de 100,000 registros.

## 🌟 Project Overview

**PharmaLocal** es una SPA (Single Page Application) moderna que ofrece:
- **Offline-First**: IndexedDB con Dexie.js (no requiere conexión a internet)
- **Escalabilidad**: Manejo eficiente de 100,000+ registros con queries indexadas
- **Sistema de Temas**: Luz, Oscuro y Alto Contraste con soporte de accesibilidad
- **Exportación Profesional**: PDF nativo y Excel con estilos avanzados
- **Sin Backend**: Toda la persistencia es local en el navegador

## 🛠️ Tech Stack

### Core
- **Frontend**: React 18 (Componentes funcionales con Hooks)
- **Estilos**: Tailwind CSS 3.3 + CSS Variables (Theming)
- **Iconos**: Lucide-React
- **Lenguaje**: TypeScript 5.0
- **Build Tool**: Vite 4.4
- **Gestor de Paquetes**: npm

### Persistencia y Datos
- **Base de Datos**: IndexedDB via **Dexie.js 4.2** (Offline-First, async operations)
- **Capacidad de Almacenamiento**: ~50-100MB (vs ~5-10MB con localStorage)
- **Migración Automática**: Desde localStorage a IndexedDB (Diciembre 2024)

### Exportación de Datos
- **PDF Nativo**: jsPDF 2.5 + jspdf-autotable 3.5 (vectorial, no canvas)
- **Excel con Estilos**: xlsx-js-style 1.2

### Despliegue
- **Hosting**: GitHub Pages
- **Base Path**: `/literate-palm-tree/`
- **CI/CD**: GitHub Actions

## 🎯 Características Principales

### 1. Dashboard Unificado (TreatmentDashboard)
- **6 Pestañas Integradas**:
  - **Inicio**: Estadísticas y resumen general del sistema
  - **Tratamiento**: Selección de medicamentos con búsqueda inteligente
  - **Información**: Agrupación de medicamentos por grupo farmacológico
  - **Calendario**: Planning visual con dropdown de pacientes
  - **Informe**: Generación de PDF profesional con Planning Visual
  - **Base de Datos**: Visualización de tratamientos y gestión de datos

### 2. Gestión de Medicamentos
- CRUD completo con operaciones async
- Campos clave:
  - Nombre comercial (requerido)
  - Principios activos
  - Grupo farmacológico (nuevo sistema de clasificación)
  - Acción farmacológica (opcional, legacy)
  - Instrucciones de administración y conservación
  - Iconos personalizados (píldora, jarabe, inyección, cápsula, crema)
- Buscador rápido y filtros
- Tarjetas colapsables con detalles completos

### 3. Gestión de Pacientes
- Registro completo con datos personales
- Historial de tratamientos activos e inactivos
- Información médica relevante
- Dropdown de selección en el calendario
- Operaciones async con IndexedDB

### 4. Planificador de Tratamientos
- Asignación de medicamentos a pacientes
- **Planning Visual**: Selección de horarios en timeline (0-23h)
- Instrucciones personalizadas por medicamento
- Estados: Activo / Inactivo
- Función de impresión optimizada

### 5. Exportación e Informes

#### PDF Nativo (Planning Visual)
- Generación de "Hojas de Tratamiento" profesionales
- Timeline visual de medicación (0-23 horas)
- Formato A4 optimizado para impresión
- Letras grandes y legibles para pacientes
- Incluye:
  - Información del paciente
  - Medicamentos con horarios visuales
  - Advertencias de seguridad
  - Firma del profesional sanitario
  - Codificación UTF-8 correcta

#### Excel con Estilos
- Exportación de medicamentos, pacientes y tratamientos
- Estilos profesionales: encabezados, colores, bordes
- Filtros automáticos en columnas
- Formato configurable

### 6. Seguridad de Datos
- **Backup/Restore**: Exportar e importar datos completos en JSON
- **Borrado Seguro**: Confirmación doble para borrar todos los datos
- **Datos Locales**: Nunca se envían a servidores externos
- **Migración Automática**: Desde localStorage a IndexedDB (una sola vez)

## 💾 IndexedDB Storage (Dexie.js)

### Arquitectura de Base de Datos

```typescript
// Database: PharmaLocalDB (Version 1)
{
  medicines: {
    keyPath: 'id',
    indexes: ['comercialName', 'pharmacologicalGroup', 'createdAt']
  },
  patients: {
    keyPath: 'id',
    indexes: ['fullName', 'cedula', 'createdAt']
  },
  treatments: {
    keyPath: 'id',
    indexes: ['patientId', 'medicineId', 'isActive', 'startDate', 'createdAt']
  }
}
```

### StorageService API (Todos los métodos async)

#### Medicamentos
```typescript
await StorageService.addMedicine(medicine: Medicine): Promise<string>
await StorageService.updateMedicine(medicine: Medicine): Promise<void>
await StorageService.deleteMedicine(id: string): Promise<void>
await StorageService.getMedicines(): Promise<Medicine[]>
await StorageService.getMedicineById(id: string): Promise<Medicine | undefined>
```

#### Pacientes
```typescript
await StorageService.addPatient(patient: Patient): Promise<string>
await StorageService.updatePatient(patient: Patient): Promise<void>
await StorageService.deletePatient(id: string): Promise<void>
await StorageService.getPatients(): Promise<Patient[]>
await StorageService.getPatientById(id: string): Promise<Patient | undefined>
```

#### Tratamientos
```typescript
await StorageService.addTreatment(treatment: Treatment): Promise<string>
await StorageService.updateTreatment(treatment: Treatment): Promise<void>
await StorageService.deleteTreatment(id: string): Promise<void>
await StorageService.getTreatments(): Promise<Treatment[]>
await StorageService.getTreatmentById(id: string): Promise<Treatment | undefined>
await StorageService.getTreatmentsByPatient(patientId: string): Promise<Treatment[]>
```

#### Operaciones Masivas
```typescript
await StorageService.exportData(): Promise<AppData>
await StorageService.importData(data: AppData): Promise<void>
await StorageService.clearAllData(): Promise<void>
```

### Beneficios de IndexedDB vs localStorage

| Característica | IndexedDB (Dexie.js) | localStorage |
|----------------|----------------------|--------------|
| **Capacidad** | ~50-100 MB | ~5-10 MB |
| **Operaciones** | Asíncronas (no bloquean UI) | Síncronas (bloquean UI) |
| **Rendimiento** | Queries indexadas (rápidas) | Búsqueda lineal (lenta) |
| **Escalabilidad** | 100,000+ registros | ~10,000 registros |
| **Tipos de Datos** | Objetos complejos, Blobs | Solo strings |
| **Queries** | Filtros y ordenamiento nativo | Manual en memoria |

### Migración Automática

- **Proceso**: Al cargar la app por primera vez (App.tsx)
- **Flag de Control**: `pharmalocal_migrated_to_indexeddb` en localStorage
- **Datos Migrados**: Medicamentos, Pacientes, Tratamientos
- **Pantalla de Carga**: Spinner con mensaje durante la migración
- **Seguridad**: Solo se ejecuta una vez, preserva todos los datos

## 🎨 Theme System

### CSS Variables (3 Temas Completos)

Definidos en `src/index.css`:

#### Colores de Superficies
```css
--surface-page          /* Fondo principal de la página */
--surface-card          /* Fondo de tarjetas */
--surface-hover         /* Hover en elementos interactivos */
--surface-sidebar       /* Fondo del sidebar */
--surface-sidebar-hover /* Hover en items del sidebar */
--surface-sidebar-active /* Item activo del sidebar */
```

#### Colores de Texto
```css
--text-primary          /* Texto principal (headings, contenido importante) */
--text-secondary        /* Texto secundario (descripciones) */
--text-muted            /* Texto terciario (hints, notas) */
--text-inverse          /* Texto sobre fondos oscuros */
--text-sidebar          /* Texto en sidebar */
--text-sidebar-muted    /* Texto muted en sidebar */
```

#### Colores de Borde y Acentos
```css
--border-default        /* Bordes estándar */
--border-subtle         /* Bordes sutiles */
--border-sidebar        /* Bordes en sidebar */

--accent-primary        /* Azul clínico (botones primarios) */
--accent-danger         /* Rojo (acciones destructivas) */
--accent-success        /* Verde (confirmaciones) */
--accent-warning        /* Naranja (advertencias) */
```

#### Sombras y Tipografía
```css
--shadow-sm, --shadow-md, --shadow-lg
--text-base, --text-sm, --text-xs, --text-lg, --text-xl, --text-2xl
```

### Semantic Utility Classes

Definidas con `@layer components` en `src/index.css`:

```css
/* Superficies */
.surface-page, .surface-card, .surface-hover
.surface-sidebar, .surface-sidebar-hover, .surface-sidebar-active

/* Texto */
.text-primary, .text-secondary, .text-muted, .text-inverse
.text-sidebar, .text-sidebar-muted

/* Bordes */
.border-default, .border-subtle, .border-sidebar

/* Botones (incluyen hover) */
.button-primary, .button-danger, .button-success

/* Badges */
.badge-primary, .badge-success, .badge-warning, .badge-danger

/* Sombras */
.shadow-themed-sm, .shadow-themed-md, .shadow-themed-lg
```

### Theme Context

**Ubicación**: `src/contexts/ThemeContext.tsx`

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'high-contrast';
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

// Hook
const { theme, setTheme, cycleTheme } = useTheme();
```

**Persistencia**: localStorage (`pharmalocal_theme`)  
**Atributo HTML**: `data-theme` en `<html>` root

### Theme Switcher

**Ubicación**: Parte inferior del Sidebar (`src/components/Sidebar.tsx`)

- **Botón**: Icono dinámico (Sun/Moon/Contrast) + Label (Claro/Oscuro/Alto Contraste)
- **Función**: Cicla entre los 3 temas: light → dark → high-contrast → light
- **Visual**: Feedback inmediato en toda la interfaz

## ♿ Accessibility Features

### Contraste y Visibilidad
- **WCAG AA Compliance**: Ratios de contraste verificados en todos los temas
- **Modo Alto Contraste**: Blanco sobre negro puro (contraste máximo)
- **Escalado de Texto**: Variables relativas (`--text-*`) soportan zoom del navegador
- **Sin Colores Hard-Coded**: Todas las clases son semánticas y se adaptan al tema

### Temas para Discapacidad Visual
- **Light**: Contraste estándar, profesional
- **Dark**: Reduce fatiga visual en ambientes con poca luz
- **High-Contrast**: Máximo contraste para usuarios con baja visión

### Navegación
- **Navegación por Teclado**: Todos los elementos interactivos son accesibles
- **Focus Visible**: Anillos de enfoque claros en todos los temas
- **Estructura Semántica**: HTML5 semántico (`<nav>`, `<main>`, `<aside>`, `<button>`)

### Usabilidad
- **Botones Grandes**: Áreas de clic generosas
- **Mensajes de Estado**: Feedback visual claro en operaciones
- **Modales Legibles**: Alto contraste en modales de confirmación
- **Print Friendly**: Hojas de tratamiento con letras grandes para pacientes mayores

## 📂 File Structure

```
pharmalocal/
├── public/
│   ├── favicon.svg
│   ├── 404.html              # Página 404 personalizada
│   └── .nojekyll             # GitHub Pages sin Jekyll
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx       # Navegación + Theme Switcher
│   │   ├── TreatmentDashboard.tsx  # Dashboard Unificado (6 tabs)
│   │   ├── Patients.tsx      # CRUD de Pacientes (async)
│   │   ├── Medicines.tsx     # CRUD de Medicamentos (async)
│   │   ├── Treatments.tsx    # CRUD de Tratamientos (async)
│   │   └── Settings.tsx      # Backup/Restore/Clear + Excel Export
│   ├── contexts/
│   │   └── ThemeContext.tsx  # Theme Provider & Hook
│   ├── storage/
│   │   └── db.ts             # Dexie DB + StorageService + Migration
│   ├── types/
│   │   └── index.ts          # TypeScript Interfaces
│   ├── utils/
│   │   └── pdfGenerator.ts   # jsPDF + Planning Visual
│   ├── App.tsx               # Main Container + Migration on Mount
│   ├── main.tsx              # Entry Point + ThemeProvider Wrapper
│   └── index.css             # CSS Variables + Semantic Classes
├── package.json
├── vite.config.ts            # Base path for GitHub Pages
├── tailwind.config.js
└── tsconfig.json
```

## 📊 Data Model (TypeScript Types)

### Medicine
```typescript
interface Medicine {
  id: string;
  comercialName: string;          // REQUERIDO (único campo obligatorio)
  activePrinciples?: string;
  pharmacologicalGroup?: string;  // Sistema de clasificación principal
  pharmacologicalAction?: string; // Legacy, opcional
  administrationInstructions?: string;
  conservationInstructions?: string;
  additionalInfo?: string;
  imageUrl?: string;
  iconType?: 'pill' | 'syrup' | 'injection' | 'capsule' | 'cream';
  createdAt: number;
}
```

### Patient
```typescript
interface Patient {
  id: string;
  fullName: string;
  cedula: string;                 // DNI/Identificación
  dateOfBirth: string;
  phone?: string;
  email?: string;
  address?: string;
  medicalConditions?: string;
  createdAt: number;
}
```

### Treatment
```typescript
interface Treatment {
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

interface TreatmentDose {
  medicineId: string;
  time: string;                   // Hora o momento del día
  dosage: string;
  specificInstructions?: string;
}
```

### TimelineScheduleEntry (Planning Visual)
```typescript
interface TimelineScheduleEntry {
  medicineId: string;
  hours: number[];                // Array de horas (0-23)
  instructions?: string;
}
```

### AppData (Backup/Restore)
```typescript
interface AppData {
  medicines: Medicine[];
  patients: Patient[];
  treatments: Treatment[];
  version: number;
}
```

## 🚀 Development Commands

```bash
# Instalar dependencias (incluye Dexie.js, jsPDF, xlsx-js-style)
npm install

# Servidor de desarrollo (http://localhost:5173 por defecto)
npm run dev

# Compilar para producción (con base path para GitHub Pages)
npm run build

# Vista previa de build de producción
npm run preview

# Linting (ESLint)
npm run lint

# Type checking (TypeScript)
npm run type-check
```

## 🌐 Deployment en GitHub Pages

### Configuración Actual
- **Branch de Deploy**: `main`
- **Source**: GitHub Actions
- **Base Path**: `/literate-palm-tree/`
- **URL**: `https://[tu-usuario].github.io/literate-palm-tree/`

### Proceso de Despliegue

1. **Configurar GitHub Pages**:
   - Ve a: `Settings > Pages` en tu repositorio
   - Selecciona: **GitHub Actions** como source

2. **Push a la rama main**:
   ```bash
   git add .
   git commit -m "Update app"
   git push origin main
   ```

3. **GitHub Actions**: Se ejecuta automáticamente y despliega

Para más detalles, consulta [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎓 Code Style Preferences

### Component Declarations
```typescript
// ✅ Correcto - Standard function syntax
export const Component = () => { ... }

// ❌ Evitar - React.FC
export const Component: React.FC = () => { ... }
```

### Imports
```typescript
// ✅ Correcto - Solo lo necesario
import { useState, useEffect } from 'react';

// ❌ Evitar - React namespace innecesario
import React, { useState, useEffect } from 'react';
```

### ID Generation
```typescript
// ✅ Directo en componentes
const newId = Date.now().toString();
```

### Date Formatting
```typescript
// ✅ Native JS con localización española
const formatted = date.toLocaleDateString('es-ES');
```

### Theming
```typescript
// ✅ Semantic utility classes
<div className="surface-card text-primary border-default">

// ❌ Hard-coded colors
<div className="bg-white text-gray-900 border-gray-300">
```

### Async Storage
```typescript
// ✅ Todas las operaciones con await
const medicines = await StorageService.getMedicines();
await StorageService.addMedicine(newMedicine);

// ❌ Olvidar await (retorna Promise sin resolver)
const medicines = StorageService.getMedicines(); // ❌
```

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- ✅ **Desktop**: 1920x1080, 1366x768, etc.
- ✅ **Tablet**: iPad, Android tablets (grid adaptativo)
- ✅ **Móvil**: iPhone, Android phones (columna única)

## 🖨️ Print Optimization

Las hojas de tratamiento incluyen:
- **Media Queries**: `@media print` para ocultar navegación
- **Formato A4**: Márgenes apropiados
- **Tipografía Clara**: Tamaños de fuente grandes y legibles
- **Colores de Impresión**: Alto contraste en blanco y negro
- **Timeline Visual**: Planning de medicación fácil de seguir

## 🌐 Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

**Requerimiento**: Soporte de IndexedDB (disponible en todos los navegadores modernos)

## 🔧 UI/UX Features

### Diseño General
- **Estilo Clínico**: Paleta azul profesional, tipografía clara
- **Idioma**: Español
- **Tarjetas Colapsables**: Detalles de medicamentos/pacientes ocultos por defecto
- **Modales de Confirmación**: Validación antes de operaciones destructivas

### Feedback Visual
- **Toast-like Messages**: Mensajes de éxito/error
- **Indicadores de Estado**: Badges para tratamientos activos/inactivos
- **Loading Screens**: Spinner durante migración de datos
- **Hover States**: Feedback inmediato en todos los elementos interactivos

### Búsqueda y Filtros
- **Buscador en Tiempo Real**: En medicamentos y pacientes
- **Filtros Debounce-Friendly**: Búsqueda sin lag
- **Dropdown Inteligente**: Selección de pacientes en calendario con formato "Nombre - Cédula"

### Exportación
- **Excel**: Botones de exportación en cada sección (verde)
- **PDF**: Botón rojo en tab "Informe" del dashboard
- **Backup JSON**: Descarga completa de datos en Configuración

### Theme Switching
- **Botón en Sidebar**: Icono y label dinámicos
- **Transición Suave**: Cambio instantáneo sin flicker
- **Persistencia**: Se recuerda la preferencia del usuario

## 📝 Recent Updates (Diciembre 2024)

### Migración a IndexedDB (✅ Completado)
- **Antes**: localStorage (5-10 MB, síncrono, limitado)
- **Ahora**: IndexedDB vía Dexie.js (50-100 MB, async, escalable)
- **Migración Automática**: Preserva todos los datos existentes
- **Beneficio**: Soporte para 100,000+ registros sin degradación de performance

### Unificación de Dashboard (✅ Completado)
- **TreatmentDashboard**: Todas las funcionalidades en 6 tabs
- **Eliminado**: Dashboard.tsx por separado (redundante)
- **Beneficio**: Workflow más fluido y coherente

### Sistema de Temas (✅ Completado)
- **3 Temas**: Light, Dark, High-Contrast
- **CSS Variables**: Personalización completa
- **Semantic Classes**: Sin colores hard-coded
- **Accesibilidad**: WCAG AA compliance
- **Beneficio**: Mejor experiencia para usuarios con discapacidad visual

### Planning Visual en PDF (✅ Completado)
- **jsPDF + jspdf-autotable**: Generación nativa (no canvas)
- **Timeline 0-23h**: Visualización clara de horarios de medicación
- **UTF-8**: Codificación correcta de caracteres españoles
- **Beneficio**: Informes profesionales para pacientes

### Dropdown de Pacientes (✅ Completado)
- **Calendario**: Selección de paciente antes de asignar tratamiento
- **Formato**: "Nombre Completo - Cédula"
- **Validación**: Alerta si no hay pacientes registrados
- **Beneficio**: Flujo más intuitivo y seguro

### Limpieza de Código (✅ Completado Nov 2024)
- ❌ Eliminado: `helpers.ts` (unused)
- ❌ Eliminado: Funciones no utilizadas en `pdfGenerator.ts` y `localStorage.ts`
- ✅ Convertido: Todos los componentes de `React.FC` a function syntax
- ✅ Optimizado: Imports (solo lo necesario)
- **Resultado**: ~150 líneas de código eliminadas, codebase más limpia

## 🔒 Privacy & Security

- **100% Local**: Todos los datos se almacenan SOLO en el navegador del usuario
- **Sin Servidores Externos**: No se envían datos a ningún backend
- **Control Total**: El usuario puede exportar, importar o borrar sus datos en cualquier momento
- **Sin Tracking**: No se utilizan cookies ni analytics
- **IndexedDB**: Datos aislados por dominio (sandboxed)

## 📄 License

Licencia MIT - Consulta el archivo [LICENSE](./LICENSE) para más detalles.

## 👨‍💻 Author

Desarrollado como Sistema de Gestión Farmacéutica Profesional.

## 🤝 Contributing

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guidelines de Contribución
- Seguir las [Code Style Preferences](#-code-style-preferences)
- Usar semantic utility classes (no hard-coded colors)
- Todas las operaciones de storage deben ser async
- Mantener accesibilidad (contrast ratios, keyboard navigation)
- Actualizar TypeScript types cuando se modifique el data model

## 📞 Support

Para preguntas, problemas o sugerencias, por favor crea un [Issue](https://github.com/[tu-usuario]/literate-palm-tree/issues) en el repositorio.

---

## 🚦 Quick Start Guide

### Primera Vez (Setup Inicial)

```bash
# 1. Clonar el repositorio
git clone https://github.com/[tu-usuario]/literate-palm-tree.git
cd literate-palm-tree

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:5173
```

### Flujo de Trabajo Típico

1. **Configurar Inventario**:
   - Ir a **Medicamentos** → Crear medicamentos con nombre comercial

2. **Registrar Pacientes**:
   - Ir a **Pacientes** → Crear pacientes con datos personales

3. **Planificar Tratamiento**:
   - Ir a **Inicio** (TreatmentDashboard)
   - Tab **Tratamiento**: Seleccionar medicamentos
   - Tab **Calendario**: Seleccionar paciente y asignar horarios (0-23h)
   - Tab **Informe**: Generar PDF con Planning Visual

4. **Exportar Datos**:
   - **Excel**: Botón verde en cada sección
   - **PDF**: Botón rojo en tab "Informe"
   - **Backup**: Ir a **Configuración** → Descargar Backup JSON

5. **Cambiar Tema**:
   - Botón en la parte inferior del Sidebar
   - Cicla: Claro → Oscuro → Alto Contraste

---

**Nota Importante**: Esta es una aplicación **Offline-First**. Todos los datos se almacenan localmente en IndexedDB de tu navegador y nunca se envían a servidores externos. Realiza backups regularmente para proteger tus datos.
