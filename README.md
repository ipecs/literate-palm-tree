# PharmaLocal: Sistema de Gestión de Atención Farmacéutica

Una aplicación web profesional para la gestión integral de atención farmacéutica. Diseñada para farmacéuticos y profesionales de la salud.

## 🎯 Características Principales

### 1. **Gestión de Medicamentos (Inventario)**
- CRUD completo de medicamentos
- Campos obligatorios:
  - Nombre comercial y principios activos
  - Acción farmacológica
  - Instrucciones de administración
  - Instrucciones de conservación
  - Lugar de dispensación
  - Información adicional
- Buscador rápido de medicamentos

### 2. **Gestión de Pacientes**
- Registro de pacientes con datos personales
- Historial de tratamientos activos e inactivos
- Información médica relevante

### 3. **Planificador de Tratamientos (Core del Sistema)**
- Asignar medicamentos a pacientes
- Definir pautas horarias (horas exactas o momentos: desayuno, comida, cena)
- **Personalización**: Sobrescribir instrucciones generales con instrucciones específicas por paciente
- Estado de tratamientos (activo/inactivo)

### 4. **Informes y Exportación**
- Generación de "Hojas de Tratamiento" visuales
- Formato profesional, amigable para pacientes
- Impresión optimizada (CSS @media print)
- Letras grandes y horarios legibles

### 5. **Seguridad de Datos**
- Exportar datos a JSON (Backup)
- Importar datos desde JSON (Restauración)
- Borrar todos los datos con confirmación de seguridad

## 🛠️ Stack Técnico

- **Frontend**: React 18 (Componentes funcionales con Hooks)
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide-React
- **Persistencia**: localStorage (Offline-First)
- **Arquitectura**: SPA (Single Page Application) - Serverless
- **TypeScript**: Para seguridad de tipos

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+ y npm

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd pharmalocal

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de compilación
npm run preview
```

La aplicación se abrirá automáticamente en `http://localhost:3000`

## 📊 Estructura de la Interfaz

```
PharmaLocal
├── Sidebar (Navegación)
│   ├── Inicio (Dashboard)
│   ├── Pacientes
│   ├── Medicamentos
│   ├── Tratamientos
│   └── Configuración
└── Vista Principal
    └── Contenido dinámico según selección
```

## 💾 Almacenamiento de Datos

### Arquitectura Offline-First
- **Toda la persistencia se realiza mediante localStorage del navegador**
- No requiere backend o conexión a internet
- Los datos se guardan localmente en el dispositivo del usuario
- Estructura de datos almacenada:

```typescript
{
  medicines: Array<Medicine>,
  patients: Array<Patient>,
  treatments: Array<Treatment>,
  version: number
}
```

## 🎨 Diseño y UX

- **Estilo Clínico/Médico**: Colores profesionales, tipografía clara
- **Responsivo**: Funciona en desktop, tablet y móvil
- **Accesibilidad**: Interfaz intuitiva y fácil de usar
- **Paleta de Colores**: Azules clínicos profesionales
- **Idioma**: Español

## 📋 Guía de Uso

### 1. Configurar Inventario
1. Ve a **Medicamentos**
2. Haz clic en **"Nuevo Medicamento"**
3. Completa todos los campos obligatorios (marcados con *)
4. Guarda

### 2. Registrar Pacientes
1. Ve a **Pacientes**
2. Haz clic en **"Nuevo Paciente"**
3. Completa información personal
4. Guarda

### 3. Crear Tratamientos
1. Ve a **Tratamientos**
2. Haz clic en **"Nuevo Tratamiento"**
3. Selecciona paciente y medicamento
4. Define pautas horarias (puedes personalizar instrucciones)
5. Guarda

### 4. Generar Hojas de Tratamiento
1. En **Tratamientos**, expande un tratamiento
2. Haz clic en **"Imprimir"**
3. La hoja se abrirá en el navegador lista para imprimir
4. Usa Ctrl+P (Cmd+P en Mac) para imprimir

### 5. Respaldar y Restaurar Datos
1. Ve a **Configuración**
2. Para respaldar: **"Descargar Backup"**
3. Para restaurar: **"Cargar Backup"**

## 🔒 Seguridad de Datos

- Los datos se almacenan SOLO en el navegador local
- Nunca se envían a servidores externos
- El usuario tiene control total sobre sus datos
- Opción para borrar todos los datos en cualquier momento

## 📝 Campos Disponibles

### Medicamento
- Nombre comercial
- Principios activos
- Acción farmacológica
- Instrucciones de administración
- Instrucciones de conservación
- Lugar de dispensación
- Información adicional

### Paciente
- Nombre completo
- Cédula/DNI
- Fecha de nacimiento
- Teléfono
- Email
- Dirección
- Condiciones médicas

### Tratamiento
- Paciente
- Medicamento
- Fecha de inicio
- Fecha de finalización (opcional)
- Estado (Activo/Inactivo)
- Pauta de administración (múltiples dosis)
  - Hora/Momento del día
  - Dosage
  - Instrucciones específicas (personalizadas)
- Notas generales

## 🎓 Ejemplos de Pautas

- **Exactas**: 08:00, 14:00, 20:00
- **Por momentos**: Desayuno, Comida, Cena
- **Combinadas**: Mañana (08:00), Tarde (14:00), Noche (21:00)
- **Específicas**: Con comida, Con agua, Antes de dormir

## 🔧 Comandos Disponibles

```bash
npm run dev           # Iniciar servidor de desarrollo
npm run build         # Compilar para producción
npm run preview       # Vista previa de compilación
npm run lint          # Ejecutar linter
npm run type-check    # Verificar tipos TypeScript
```

## 📱 Responsividad

La aplicación está completamente optimizada para:
- ✅ Desktop (1920x1080, 1366x768, etc.)
- ✅ Tablet (iPad, Android tablets)
- ✅ Móvil (iPhone, Android phones)

## 🖨️ Impresión

Las hojas de tratamiento están optimizadas para impresión:
- Formato A4
- Márgenes apropiados
- Tipografía clara y legible
- Colores de impresión amigables

## 🌐 Navegador Compatible

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 Licencia

Licencia MIT - Vea el archivo LICENSE para detalles

## 👨‍💻 Autor

Desarrollado como Sistema de Gestión Farmacéutica Profesional

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu característica
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para preguntas o problemas, por favor crea un issue en el repositorio.

---

**Nota**: Esta es una aplicación Offline-First. Todos los datos se almacenan localmente en tu navegador y nunca se envían a servidores externos.
