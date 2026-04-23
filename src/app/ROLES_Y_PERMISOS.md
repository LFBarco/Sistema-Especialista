# Sistema de Gestión de Usuarios, Roles y Permisos

## Descripción General

El sistema VetSpecialist ahora incluye un módulo completo de gestión de usuarios con control de acceso basado en roles (RBAC - Role-Based Access Control). Este sistema permite administrar usuarios, asignar roles y configurar permisos granulares para cada módulo del sistema.

## Características Principales

### 1. Gestión de Usuarios
- **Creación y edición de usuarios**: Permite agregar nuevos usuarios al sistema con información completa
- **Información del usuario**:
  - Nombre completo
  - Email
  - Teléfono
  - Especialidad (opcional, para médicos)
  - Rol asignado
  - Estado (activo/inactivo)
  - Fecha de registro

- **Funciones disponibles**:
  - Búsqueda de usuarios por nombre o email
  - Filtrado por rol y estado
  - Activar/desactivar usuarios
  - Editar información de usuarios
  - Eliminar usuarios
  - Ver detalles completos y permisos asignados

### 2. Sistema de Roles

El sistema incluye 5 roles predefinidos:

#### 🔴 Administrador
- **Descripción**: Acceso completo a todas las funcionalidades del sistema
- **Permisos**: Control total sobre todos los módulos
- **Ideal para**: Propietarios del negocio, gerentes generales

#### 🔵 Médico Especialista
- **Descripción**: Acceso completo excepto gestión de usuarios
- **Permisos**: 
  - Completo en: Solicitudes, Agenda, Servicios, Facturación, Finanzas, Clínicas
  - Solo lectura en: Usuarios
  - Completo en: Perfil propio
- **Ideal para**: Médicos veterinarios especialistas

#### 🟢 Asistente
- **Descripción**: Acceso limitado a solicitudes y agenda
- **Permisos**:
  - Ver, crear y editar: Solicitudes, Agenda
  - Solo lectura: Servicios, Facturación, Finanzas, Clínicas
  - Editar: Perfil propio
- **Ideal para**: Asistentes administrativos, recepcionistas

#### 🟣 Contador
- **Descripción**: Acceso completo a facturación y finanzas
- **Permisos**:
  - Completo en: Facturación, Finanzas
  - Exportar: Servicios
  - Solo lectura: Dashboard, Solicitudes, Agenda, Clínicas
  - Editar: Perfil propio
- **Ideal para**: Contadores, personal de finanzas

#### ⚫ Solo Lectura
- **Descripción**: Acceso de solo lectura a todos los módulos
- **Permisos**:
  - Solo lectura en todos los módulos
  - Sin permisos de creación, edición o eliminación
- **Ideal para**: Auditores, supervisores externos, usuarios temporales

### 3. Matriz de Permisos

Cada rol puede tener los siguientes permisos por módulo:

| Permiso  | Descripción                                    |
|----------|------------------------------------------------|
| Ver      | Permite visualizar la información del módulo   |
| Crear    | Permite agregar nuevos registros              |
| Editar   | Permite modificar registros existentes        |
| Eliminar | Permite borrar registros                      |
| Exportar | Permite exportar datos a formatos externos    |

### 4. Módulos del Sistema

La matriz de permisos aplica a los siguientes módulos:

1. **Dashboard**: Vista general de KPIs
2. **Solicitudes**: Bandeja de entrada de servicios
3. **Agenda**: Calendario de citas
4. **Servicios**: Historial de servicios prestados
5. **Facturación**: Gestión de facturas
6. **Finanzas**: Cuentas por cobrar y gastos
7. **Clínicas**: Directorio de clínicas
8. **Usuarios**: Gestión de usuarios (este módulo)
9. **Perfil**: Configuración personal

## Interfaz de Usuario

### Pestaña de Usuarios

La interfaz de gestión de usuarios incluye:

- **Filtros avanzados**:
  - Búsqueda por nombre o email
  - Filtro por rol
  - Filtro por estado (activo/inactivo)

- **Tarjetas de usuario** que muestran:
  - Avatar con inicial del nombre
  - Nombre y especialidad
  - Email y teléfono
  - Badge de rol con color distintivo
  - Estado (activo/inactivo)
  - Acciones rápidas (ver, editar, activar/desactivar, eliminar)

- **Modal de creación/edición** con campos:
  - Nombre completo
  - Email
  - Teléfono
  - Especialidad
  - Rol (selector)
  - Estado activo (switch)

- **Modal de detalles** que muestra:
  - Información completa del usuario
  - Permisos asignados por módulo
  - Visualización clara de capacidades

### Pestaña de Roles y Permisos

La interfaz de gestión de roles incluye:

- **Lista de roles**: Sidebar con todos los roles disponibles
- **Matriz de permisos**: Tabla interactiva que muestra:
  - Filas: Módulos del sistema
  - Columnas: Tipos de permisos (Ver, Crear, Editar, Eliminar, Exportar)
  - Checkboxes: Activar/desactivar permisos específicos
  
- **Creación de roles personalizados**: 
  - Formulario para crear nuevos roles
  - Asignación de permisos granulares
  - Descripción del rol

## Colores de Roles

Cada rol tiene un esquema de colores distintivo para facilitar la identificación:

- **Administrador**: Rojo a Rosa (red-500 to pink-500)
- **Médico Especialista**: Azul a Cian (blue-500 to cyan-500)
- **Asistente**: Verde a Esmeralda (green-500 to emerald-500)
- **Contador**: Púrpura a Índigo (purple-500 to indigo-500)
- **Solo Lectura**: Gris a Pizarra (gray-500 to slate-500)

## Flujo de Trabajo

### Agregar un nuevo usuario

1. Hacer clic en "Nuevo Usuario"
2. Completar formulario con datos del usuario
3. Seleccionar el rol apropiado
4. Activar el estado si el usuario debe tener acceso inmediato
5. Guardar

### Modificar permisos de un rol

1. Ir a la pestaña "Roles y Permisos"
2. Seleccionar el rol a modificar
3. Marcar/desmarcar los permisos en la matriz
4. Los cambios se aplican inmediatamente a todos los usuarios con ese rol

### Crear un rol personalizado

1. Ir a la pestaña "Roles y Permisos"
2. Hacer clic en "Crear Rol"
3. Ingresar nombre y descripción
4. Configurar permisos en la matriz
5. El nuevo rol estará disponible al asignar usuarios

## Integración con el Sistema

El módulo de usuarios está completamente integrado con:

- **App.tsx**: Contexto global con estado de usuarios y roles
- **Sidebar**: Nuevo ítem de menú "Usuarios" con icono de Users
- **Sistema de permisos**: Base para futuras implementaciones de control de acceso

## Datos de Ejemplo

El sistema incluye 6 usuarios de ejemplo:

1. **Dr. Juan Pérez** - Médico Especialista (Cardiología) - Activo
2. **Dra. María López** - Médico Especialista (Cardiología) - Activo
3. **Ana García** - Asistente - Activo
4. **Carlos Rodríguez** - Contador - Activo
5. **Luis Martínez** - Administrador - Activo
6. **Sofia Torres** - Solo Lectura (Oftalmología) - Inactivo

## Consideraciones de Seguridad

Este es un módulo de frontend que gestiona la visualización de permisos. Para una implementación en producción, se requiere:

1. **Backend de autenticación**: Validación de credenciales
2. **Tokens JWT**: Almacenamiento seguro de sesión
3. **Middleware de autorización**: Validación de permisos en el servidor
4. **Encriptación de contraseñas**: Hash seguro (bcrypt, argon2)
5. **Auditoría**: Registro de cambios en usuarios y permisos
6. **2FA**: Autenticación de dos factores para roles críticos

## Próximos Pasos Recomendados

1. Implementar autenticación con login/logout
2. Agregar gestión de contraseñas
3. Implementar validación de permisos en cada módulo
4. Agregar logs de auditoría
5. Crear dashboard de actividad de usuarios
6. Implementar autenticación de dos factores
7. Agregar notificaciones de cambios de permisos

## Tecnologías Utilizadas

- React con TypeScript
- Tailwind CSS para estilos
- Lucide React para iconos
- Radix UI para componentes base (tabs, select, switch)
- Context API para gestión de estado global
