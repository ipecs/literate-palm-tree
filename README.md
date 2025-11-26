🏥 Guía de Usuario: PharmaLocal

Sistema de Gestión de Atención Farmacéutica

PharmaLocal es una herramienta profesional diseñada para facilitar la gestión de pacientes, medicamentos y tratamientos. Su principal ventaja es que funciona directamente en tu navegador y no requiere conexión a internet para operar una vez cargada, garantizando velocidad y privacidad total.
🌟 Lo que debes saber (Características Principales)
1. Privacidad y Seguridad Total

    Tus datos son tuyos: La información de tus pacientes nunca sale de tu computadora. No se envía a la "nube" ni a servidores externos.

    Funcionamiento Offline: Puedes trabajar sin internet. Todo se guarda automáticamente en la memoria de tu navegador.

    Copias de Seguridad: Dado que los datos viven en tu dispositivo, el sistema incluye una herramienta fácil para Exportar (Backup) toda tu información y guardarla en un archivo seguro en tu computadora.

2. Panel de Control Unificado (Dashboard)

Desde la pantalla de inicio, tienes acceso rápido a 6 herramientas:

    Inicio: Resumen y estadísticas de tu farmacia.

    Tratamiento: Selección rápida de medicamentos.

    Información: Base de datos farmacológica organizada.

    Calendario: Planificador visual para asignar horarios a pacientes.

    Informe: Generador de hojas de tratamiento en PDF.

    Base de Datos: Vista general de todos los registros.

3. Gestión de Medicamentos

Organiza tu inventario farmacéutico de forma detallada:

    Ficha Completa: Nombre comercial, principios activos, grupo farmacológico e instrucciones.

    Iconos Visuales: Identifica rápidamente si es píldora, jarabe, inyección, cápsula o crema.

    Buscador Inteligente: Encuentra medicamentos al instante mientras escribes.

4. Gestión de Pacientes

    Expediente digital con datos personales e historial médico.

    Historial de tratamientos (activos y pasados).

    Búsqueda rápida por nombre o documento de identidad.

5. Planificador Visual de Tratamientos

La joya del sistema para la adherencia al tratamiento:

    Timeline de 24 horas: Asigna medicamentos visualmente en una línea de tiempo de 0 a 23 horas.

    Instrucciones Claras: Añade notas específicas (ej: "Tomar con comida").

    Asignación Simple: Selecciona un paciente del listado y asígnale su medicación fácilmente.

🖨️ Exportación e Informes
Hoja de Tratamiento (PDF)

Genera documentos profesionales listos para imprimir y entregar al paciente:

    Diseño Claro: Letra grande y legible, ideal para pacientes mayores.

    Horario Visual: Muestra gráficamente a qué hora tomar cada medicamento.

    Formato A4: Optimizado para impresoras estándar.

    Seguridad: Incluye advertencias y espacio para tu firma profesional.

Excel

Si necesitas trabajar con datos masivos, puedes exportar tus listas de pacientes, medicamentos o tratamientos a formato Excel con un solo clic (botones verdes).
🎨 Personalización y Accesibilidad

El sistema se adapta a tus necesidades visuales y al entorno de trabajo:

    Tema Claro (Día): Estándar clínico profesional.

    Tema Oscuro (Noche): Reduce la fatiga visual en ambientes con poca luz.

    Alto Contraste: Modo especial (blanco sobre negro puro) para máxima legibilidad.

    ¿Cómo cambiarlo? Busca el botón en la parte inferior del menú lateral para alternar entre los modos.

🚀 Flujo de Trabajo Sugerido

Para empezar a usar PharmaLocal eficientemente:

    Crea tu Inventario: Ve a la sección Medicamentos y registra los fármacos disponibles.

    Registra al Paciente: Ve a Pacientes e ingresa sus datos básicos.

    Asigna el Tratamiento:

        Ve al Inicio (Dashboard) -> Pestaña Calendario.

        Selecciona al paciente en el menú desplegable.

        Elige los medicamentos y marca las horas de toma en la línea de tiempo.

    Imprime:

        Ve a la pestaña Informe.

        Haz clic en el botón rojo para descargar el PDF y entrégalo al paciente.

⚠️ Recomendación Importante

Como el sistema es 100% privado y local, si borras los datos de navegación (caché/cookies) de tu navegador, podrías perder la información.

Hábito recomendado: Ve a Configuración regularmente y descarga un Backup (Copia de seguridad). Así siempre tendrás tus datos a salvo.

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
