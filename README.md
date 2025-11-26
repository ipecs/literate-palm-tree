# 🏥 PharmaLocal: Sistema de Gestión de Atención Farmacéutica

**PharmaLocal** es una herramienta profesional diseñada para facilitar la gestión de pacientes, medicamentos y tratamientos farmacéuticos. 

Su principal ventaja es la **privacidad y autonomía**: funciona directamente en tu navegador y **no requiere conexión a internet** para operar una vez cargada.

---

## 🌟 Características Principales

### 🛡️ 1. Privacidad y Seguridad Total
*   **Tus datos son tuyos:** La información de tus pacientes **nunca** sale de tu computadora. No se envía a la "nube" ni a servidores externos.
*   **Funcionamiento Offline:** Puedes trabajar sin internet. Todo se guarda automáticamente en la memoria de tu navegador.
*   **Copias de Seguridad:** El sistema incluye una herramienta sencilla para **Exportar (Backup)** toda tu información y guardarla en un archivo seguro en tu computadora.

### 🖥️ 2. Panel de Control Unificado
Desde la pantalla de inicio, tienes acceso rápido a todas las herramientas necesarias:
*   **Inicio:** Resumen y estadísticas de tu farmacia.
*   **Tratamiento:** Selección rápida de medicamentos.
*   **Calendario:** Planificador visual para asignar horarios a pacientes.
*   **Informe:** Generador de hojas de tratamiento en PDF.
*   **Base de Datos:** Vista general de todos los registros.

### 💊 3. Gestión de Medicamentos
Organiza tu inventario farmacéutico de forma detallada:
*   **Ficha Completa:** Nombre comercial, principios activos, grupo farmacológico e instrucciones.
*   **Iconos Visuales:** Identifica rápidamente el tipo de medicamento (píldora, jarabe, inyección, etc.).
*   **Buscador Inteligente:** Encuentra medicamentos al instante mientras escribes.

### 👥 4. Gestión de Pacientes
*   Expediente digital con datos personales.
*   Historial de tratamientos activos y pasados.
*   Búsqueda rápida por nombre o documento de identidad.

### 📅 5. Planificador Visual de Tratamientos
La herramienta clave para mejorar la adherencia al tratamiento:
*   **Timeline de 24 horas:** Asigna medicamentos visualmente en una línea de tiempo de 0 a 23 horas.
*   **Instrucciones Claras:** Añade notas específicas (ej: "Tomar con comida").
*   **Asignación Simple:** Selecciona un paciente del listado y asígnale su medicación fácilmente.

---

## 🖨️ Exportación e Informes

### 📄 Hoja de Tratamiento (PDF)
Genera documentos profesionales listos para imprimir y entregar al paciente:
*   **Diseño Claro:** Letra grande y legible, ideal para pacientes mayores.
*   **Horario Visual:** Muestra gráficamente a qué hora tomar cada medicamento.
*   **Formato A4:** Optimizado para impresoras estándar.
*   **Seguridad:** Incluye advertencias y espacio para firma profesional.

### 📊 Excel
Exporta tus listas de pacientes, medicamentos o tratamientos a formato Excel con un solo clic para tareas administrativas.

---

## 🎨 Personalización y Accesibilidad

El sistema se adapta a tus necesidades visuales y al entorno de trabajo mediante 3 temas integrados:

1.  **Tema Claro (Día):** Estándar clínico profesional.
2.  **Tema Oscuro (Noche):** Reduce la fatiga visual en ambientes con poca luz.
3.  **Alto Contraste:** Modo especial (blanco sobre negro puro) para máxima legibilidad.

> **Nota:** Puedes cambiar el tema en cualquier momento usando el botón situado en la parte inferior del menú lateral.

---

## 🚀 Guía de Inicio Rápido

Sigue estos 4 pasos para empezar a usar PharmaLocal:

1.  **Crea tu Inventario:** Ve a la sección **Medicamentos** y registra los fármacos disponibles.
2.  **Registra al Paciente:** Ve a **Pacientes** e ingresa sus datos básicos.
3.  **Asigna el Tratamiento:**
    *   Ve al **Inicio** -> Pestaña **Calendario**.
    *   Selecciona al paciente en el menú desplegable.
    *   Elige los medicamentos y marca las horas de toma en la línea de tiempo.
4.  **Imprime:**
    *   Ve a la pestaña **Informe**.
    *   Haz clic en el botón rojo para descargar el PDF y entrégalo al paciente.

---

## ⚠️ Recomendación Importante sobre tus Datos

Dado que PharmaLocal es un sistema **100% privado y local**, los datos viven en tu navegador.

> **¡Importante!** Si borras el historial de navegación (caché/cookies) podrías perder la información. 
> 
> **Hábito recomendado:** Ve a la sección **Configuración** regularmente y descarga un **Backup (Copia de seguridad)**. Así siempre tendrás tus datos a salvo en tu computadora.

---

**PharmaLocal** - Gestión Farmacéutica Simplificada.

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
