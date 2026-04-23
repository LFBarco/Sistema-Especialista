import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  Clock,
  Bell,
  Save,
  Shield,
  Key,
  FileText,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  EyeOff,
  Palette,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../App";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Tipos para Usuarios de Clínica
interface UsuarioClinica {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string; // Ahora puede ser cualquier string (predefinido o personalizado)
  activo: boolean;
  fechaRegistro: string;
  sedesIds?: string[]; // IDs de las sedes asignadas
}

interface RolConfig {
  nombre: string;
  descripcion: string;
  color: string;
  permisos: {
    dashboard: boolean;
    agenda: boolean;
    solicitudes: boolean;
    facturas: boolean;
    estadoCuenta: boolean;
    configuracion: boolean;
  };
  esPersonalizado: boolean;
}

type RolesClinicaType = Record<string, RolConfig>;

// Colores predefinidos para roles personalizados
const coloresDisponibles = [
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Azul", valor: "#3B82F6" },
  { nombre: "Verde", valor: "#10B981" },
  { nombre: "Amarillo", valor: "#F59E0B" },
  { nombre: "Morado", valor: "#8B5CF6" },
  { nombre: "Rosa", valor: "#EC4899" },
  { nombre: "Cyan", valor: "#06B6D4" },
  { nombre: "Naranja", valor: "#F97316" },
  { nombre: "Lima", valor: "#84CC16" },
  { nombre: "Índigo", valor: "#6366F1" },
];

export function PerfilClinica() {
  const { darkMode, sedes } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] =
    useState<UsuarioClinica | null>(null);
  const [showMatrizPermisos, setShowMatrizPermisos] =
    useState(false);
  const [showRolModal, setShowRolModal] = useState(false);
  const [editingRol, setEditingRol] = useState<string | null>(
    null,
  );

  // Estado de configuración de la clínica
  const [clinicConfig, setClinicConfig] = useState({
    // Información de la Clínica
    nombreClinica: "",
    ruc: "",
    direccion: "",
    ciudad: "",
    codigoPostal: " ",
    telefono: " ",
    email: " ",
    sitioWeb: " ",

    // Contacto Principal
    nombreContacto: " ",
    emailContacto: " ",
    telefonoContacto: " ",

    // Preferencias del Sistema
    moneda: "MXN", // MXN, USD, COP, etc.
    formatoHorario: "12", // '12' o '24' horas

    // Preferencias de Notificaciones
    notificaciones: {
      emailNuevaSolicitudAceptada: true,
      emailNuevaSolicitudRechazada: true,
      emailRecordatorioServicio: true,
      emailNuevaFactura: true,
      emailRecordatorioPago: true,
      smsRecordatorioServicio: false,
      smsFacturaGenerada: false,
    },

    // Configuración de Servicios
    serviciosPreferidos: [] as string[],
    horarioContacto: {
      inicio: "09:00",
      fin: "18:00",
    },
  });

  // Estado de roles (predefinidos + personalizados)
  const [rolesClinica, setRolesClinica] =
    useState<RolesClinicaType>({
      admin: {
        nombre: "Administrador",
        descripcion: "Acceso completo a todos los módulos",
        color: "#EF4444",
        permisos: {
          dashboard: true,
          agenda: true,
          solicitudes: true,
          facturas: true,
          estadoCuenta: true,
          configuracion: true,
        },
        esPersonalizado: false,
      },
      asistente: {
        nombre: "Asistente Veterinario",
        descripcion: "Puede solicitar servicios y ver agenda",
        color: "#3B82F6",
        permisos: {
          dashboard: true,
          agenda: true,
          solicitudes: true,
          facturas: false,
          estadoCuenta: false,
          configuracion: false,
        },
        esPersonalizado: false,
      },
      contador: {
        nombre: "Contador",
        descripcion: "Solo acceso a finanzas y facturas",
        color: "#10B981",
        permisos: {
          dashboard: true,
          agenda: false,
          solicitudes: false,
          facturas: true,
          estadoCuenta: true,
          configuracion: false,
        },
        esPersonalizado: false,
      },
      recepcionista: {
        nombre: "Recepcionista",
        descripcion: "Solo puede ver agenda",
        color: "#F59E0B",
        permisos: {
          dashboard: true,
          agenda: true,
          solicitudes: false,
          facturas: false,
          estadoCuenta: false,
          configuracion: false,
        },
        esPersonalizado: false,
      },
    });

  // Estado de usuarios de la clínica (se cargan desde el backend)
  const [usuariosClinica, setUsuariosClinica] = useState<
    UsuarioClinica[]
  >([]);

  // Estado del formulario de usuario
  const [formUsuario, setFormUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    rol: "asistente",
    sedesIds: [] as string[],
  });

  // Estado del formulario de rol
  const [formRol, setFormRol] = useState({
    nombre: "",
    descripcion: "",
    color: "#8B5CF6",
    permisos: {
      dashboard: true,
      agenda: false,
      solicitudes: false,
      facturas: false,
      estadoCuenta: false,
      configuracion: false,
    },
  });

  const handleSave = () => {
    setEditMode(false);
    toast.success("Configuración guardada correctamente");
    console.log("Configuración guardada:", clinicConfig);
  };

  const handleAgregarUsuario = () => {
    setEditingUser(null);
    setFormUsuario({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      rol: "asistente",
      sedesIds: [],
    });
    setShowUserModal(true);
  };

  const handleEditarUsuario = (usuario: UsuarioClinica) => {
    setEditingUser(usuario);
    setFormUsuario({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
      sedesIds: usuario.sedesIds || [],
    });
    setShowUserModal(true);
  };

  const handleGuardarUsuario = () => {
    if (
      !formUsuario.nombre ||
      !formUsuario.apellido ||
      !formUsuario.email
    ) {
      toast.error(
        "Por favor completa todos los campos requeridos",
      );
      return;
    }

    if (editingUser) {
      // Editar usuario existente
      setUsuariosClinica((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, ...formUsuario }
            : u,
        ),
      );
      toast.success("Usuario actualizado correctamente");
    } else {
      // Crear nuevo usuario
      const nuevoUsuario: UsuarioClinica = {
        id: Date.now(),
        ...formUsuario,
        activo: true,
        fechaRegistro: new Date().toISOString().split("T")[0],
      };
      setUsuariosClinica((prev) => [...prev, nuevoUsuario]);
      toast.success("Usuario creado correctamente");
    }

    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleEliminarUsuario = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      setUsuariosClinica((prev) =>
        prev.filter((u) => u.id !== id),
      );
      toast.success("Usuario eliminado correctamente");
    }
  };

  const handleToggleActivo = (id: number) => {
    setUsuariosClinica((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, activo: !u.activo } : u,
      ),
    );
  };

  // Funciones para manejo de roles
  const handleCrearRol = () => {
    setEditingRol(null);
    setFormRol({
      nombre: "",
      descripcion: "",
      color: "#8B5CF6",
      permisos: {
        dashboard: true,
        agenda: false,
        solicitudes: false,
        facturas: false,
        estadoCuenta: false,
        configuracion: false,
      },
    });
    setShowRolModal(true);
  };

  const handleEditarRol = (rolKey: string) => {
    const rol = rolesClinica[rolKey];
    if (!rol.esPersonalizado) {
      toast.error(
        "No puedes editar roles predefinidos del sistema",
      );
      return;
    }

    setEditingRol(rolKey);
    setFormRol({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      color: rol.color,
      permisos: { ...rol.permisos },
    });
    setShowRolModal(true);
  };

  const handleGuardarRol = () => {
    if (!formRol.nombre.trim()) {
      toast.error("Por favor ingresa un nombre para el rol");
      return;
    }

    // Verificar que al menos un permiso esté seleccionado
    const tienePermisos = Object.values(formRol.permisos).some(
      (p) => p,
    );
    if (!tienePermisos) {
      toast.error("El rol debe tener al menos un permiso");
      return;
    }

    if (editingRol) {
      // Editar rol existente
      setRolesClinica((prev) => ({
        ...prev,
        [editingRol]: {
          ...formRol,
          esPersonalizado: true,
        },
      }));
      toast.success("Rol actualizado correctamente");
    } else {
      // Crear nuevo rol
      const rolKey = formRol.nombre
        .toLowerCase()
        .replace(/\s+/g, "_");

      // Verificar que no exista ya
      if (rolesClinica[rolKey]) {
        toast.error("Ya existe un rol con ese nombre");
        return;
      }

      setRolesClinica((prev) => ({
        ...prev,
        [rolKey]: {
          ...formRol,
          esPersonalizado: true,
        },
      }));
      toast.success("Rol creado correctamente");
    }

    setShowRolModal(false);
    setEditingRol(null);
  };

  const handleEliminarRol = (rolKey: string) => {
    const rol = rolesClinica[rolKey];

    if (!rol.esPersonalizado) {
      toast.error(
        "No puedes eliminar roles predefinidos del sistema",
      );
      return;
    }

    // Verificar si hay usuarios con este rol
    const usuariosConRol = usuariosClinica.filter(
      (u) => u.rol === rolKey,
    );
    if (usuariosConRol.length > 0) {
      toast.error(
        `No puedes eliminar este rol porque ${usuariosConRol.length} usuario(s) lo tienen asignado`,
      );
      return;
    }

    if (
      confirm(
        `¿Estás seguro de eliminar el rol "${rol.nombre}"?`,
      )
    ) {
      const { [rolKey]: _, ...restRoles } = rolesClinica;
      setRolesClinica(restRoles);
      toast.success("Rol eliminado correctamente");
    }
  };

  const handleTogglePermiso = (
    modulo: keyof typeof formRol.permisos,
  ) => {
    setFormRol((prev) => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [modulo]: !prev.permisos[modulo],
      },
    }));
  };

  const modulosLabels: Record<string, string> = {
    dashboard: "Dashboard",
    agenda: "Disponibilidad",
    solicitudes: "Mis Solicitudes",
    facturas: "Mis Facturas",
    estadoCuenta: "Estado de Cuenta",
    configuracion: "Configuración",
  };

  const modulosDescripciones: Record<string, string> = {
    dashboard: "Vista general con métricas y resúmenes",
    agenda:
      "Ver disponibilidad del especialista y solicitar servicios",
    solicitudes: "Ver estado de solicitudes enviadas",
    facturas: "Acceso a facturas emitidas",
    estadoCuenta: "Información financiera y pagos",
    configuracion: "Gestión de clínica, usuarios y roles",
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
        <div>
          <h1
            className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Configuración de Clínica
          </h1>
          <p
            className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Administra la información, usuarios y preferencias
            de tu clínica
          </p>
        </div>
        <button
          onClick={() =>
            editMode ? handleSave() : setEditMode(true)
          }
          className="px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center gap-2"
          style={{
            background:
              "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            boxShadow: "0 4px 16px rgba(249, 115, 22, 0.4)",
          }}
        >
          {editMode ? (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          ) : (
            "Editar Configuración"
          )}
        </button>
      </div>

      {/* Información de la Clínica */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            <Building2 className="w-5 h-5 text-orange-500" />
            Información de la Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de la Clínica */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Nombre de la Clínica
              </label>
              <input
                type="text"
                value={clinicConfig.nombreClinica}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    nombreClinica: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* RFC */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                RFC
              </label>
              <input
                type="text"
                value={clinicConfig.rfc}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    rfc: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Dirección Completa */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Dirección
              </label>
              <input
                type="text"
                value={clinicConfig.direccion}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    direccion: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Ciudad */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Ciudad
              </label>
              <input
                type="text"
                value={clinicConfig.ciudad}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    ciudad: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Código Postal */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Código Postal
              </label>
              <input
                type="text"
                value={clinicConfig.codigoPostal}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    codigoPostal: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Teléfono */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Teléfono
              </label>
              <input
                type="tel"
                value={clinicConfig.telefono}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    telefono: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Email */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Email
              </label>
              <input
                type="email"
                value={clinicConfig.email}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    email: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Sitio Web */}
            <div className="md:col-span-2">
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Sitio Web
              </label>
              <input
                type="url"
                value={clinicConfig.sitioWeb}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    sitioWeb: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usuarios y Roles */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle
              className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              <Users className="w-5 h-5 text-blue-500" />
              Usuarios y Permisos
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  setShowMatrizPermisos(!showMatrizPermisos)
                }
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Shield className="w-4 h-4" />
                {showMatrizPermisos
                  ? "Ocultar Matriz"
                  : "Ver Matriz de Permisos"}
              </button>
              <button
                onClick={handleCrearRol}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:scale-105 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  boxShadow:
                    "0 4px 12px rgba(139, 92, 246, 0.4)",
                }}
              >
                <Plus className="w-4 h-4" />
                Crear Rol
              </button>
              <button
                onClick={handleAgregarUsuario}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white transition-all hover:scale-105 flex items-center gap-2"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                  boxShadow:
                    "0 4px 12px rgba(59, 130, 246, 0.4)",
                }}
              >
                <Plus className="w-4 h-4" />
                Agregar Usuario
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Matriz de Permisos */}
          {showMatrizPermisos && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-xl border-2 ${
                darkMode
                  ? "bg-gray-900/50 border-gray-700"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  Matriz de Permisos por Rol
                </h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500 text-white">
                    Predefinido
                  </Badge>
                  <Badge className="bg-purple-500 text-white">
                    Personalizado
                  </Badge>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      className={`border-b-2 ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                    >
                      <th
                        className={`text-left p-3 font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Módulo
                      </th>
                      {Object.entries(rolesClinica).map(
                        ([key, rol]) => (
                          <th
                            key={key}
                            className="text-center p-3"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <Badge
                                className="font-bold text-white"
                                style={{
                                  backgroundColor: rol.color,
                                }}
                              >
                                {rol.nombre}
                              </Badge>
                              {rol.esPersonalizado && (
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() =>
                                      handleEditarRol(key)
                                    }
                                    className="p-1 rounded hover:bg-white/20"
                                    title="Editar rol"
                                  >
                                    <Edit2 className="w-3 h-3 text-white" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleEliminarRol(key)
                                    }
                                    className="p-1 rounded hover:bg-white/20"
                                    title="Eliminar rol"
                                  >
                                    <Trash2 className="w-3 h-3 text-white" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(modulosLabels).map(
                      ([moduloKey, moduloLabel]) => (
                        <tr
                          key={moduloKey}
                          className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}
                        >
                          <td
                            className={`p-3 font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {moduloLabel}
                          </td>
                          {Object.entries(rolesClinica).map(
                            ([rolKey, rol]) => (
                              <td
                                key={rolKey}
                                className="text-center p-3"
                              >
                                {rol.permisos[
                                  moduloKey as keyof typeof rol.permisos
                                ] ? (
                                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                                ) : (
                                  <X className="w-5 h-5 text-red-500 mx-auto" />
                                )}
                              </td>
                            ),
                          )}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Lista de Usuarios */}
          <div className="space-y-3">
            {usuariosClinica.map((usuario) => {
              const rolInfo = rolesClinica[usuario.rol];
              return (
                <div
                  key={usuario.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    darkMode
                      ? "border-gray-700 bg-gray-900/50 hover:border-gray-600"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  } ${!usuario.activo ? "opacity-50" : ""}`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3
                          className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {usuario.nombre} {usuario.apellido}
                        </h3>
                        <Badge
                          className="font-bold text-white"
                          style={{
                            backgroundColor:
                              rolInfo?.color || "#6B7280",
                          }}
                        >
                          {rolInfo?.nombre || "Sin rol"}
                        </Badge>
                        {rolInfo?.esPersonalizado && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 font-bold">
                            Personalizado
                          </Badge>
                        )}
                        {!usuario.activo && (
                          <Badge className="bg-gray-500 text-white font-bold">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div
                          className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          <Mail className="w-4 h-4" />
                          {usuario.email}
                        </div>
                        <div
                          className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          <Phone className="w-4 h-4" />
                          {usuario.telefono}
                        </div>
                        <div
                          className={`flex items-center gap-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        >
                          <Clock className="w-4 h-4" />
                          Desde{" "}
                          {new Date(
                            usuario.fechaRegistro,
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Sedes Asignadas */}
                      <div className="mt-3 flex items-center gap-2">
                        <MapPin
                          className={`w-4 h-4 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                        />
                        <div className="flex flex-wrap gap-1">
                          {!usuario.sedesIds ||
                          usuario.sedesIds.length === 0 ? (
                            <Badge
                              variant="outline"
                              className={`${darkMode ? "border-blue-500/50 text-blue-400" : "border-blue-200 text-blue-600 bg-blue-50"}`}
                            >
                              Acceso Global (Todas las sedes)
                            </Badge>
                          ) : (
                            usuario.sedesIds.map((sedeId) => {
                              const sede = sedes.find(
                                (s) => s.id === sedeId,
                              );
                              return sede ? (
                                <Badge
                                  key={sedeId}
                                  variant="outline"
                                  className={`${darkMode ? "border-gray-700 text-gray-300" : "border-gray-200 text-gray-600"}`}
                                >
                                  {sede.nombre}
                                </Badge>
                              ) : null;
                            })
                          )}
                        </div>
                      </div>

                      <p
                        className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
                      >
                        {rolInfo?.descripcion ||
                          "Rol sin descripción"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleActivo(usuario.id)
                        }
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                        title={
                          usuario.activo
                            ? "Desactivar"
                            : "Activar"
                        }
                      >
                        {usuario.activo ? (
                          <Eye
                            className={`w-5 h-5 ${darkMode ? "text-green-400" : "text-green-600"}`}
                          />
                        ) : (
                          <EyeOff
                            className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleEditarUsuario(usuario)
                        }
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "bg-blue-500/20 hover:bg-blue-500/30"
                            : "bg-blue-100 hover:bg-blue-200"
                        }`}
                      >
                        <Edit2 className="w-5 h-5 text-blue-500" />
                      </button>
                      <button
                        onClick={() =>
                          handleEliminarUsuario(usuario.id)
                        }
                        className={`p-2 rounded-lg transition-all ${
                          darkMode
                            ? "bg-red-500/20 hover:bg-red-500/30"
                            : "bg-red-100 hover:bg-red-200"
                        }`}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Contacto Principal */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            <User className="w-5 h-5 text-purple-500" />
            Contacto Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nombre del Contacto */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Nombre Completo
              </label>
              <input
                type="text"
                value={clinicConfig.nombreContacto}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    nombreContacto: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Email del Contacto */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Email
              </label>
              <input
                type="email"
                value={clinicConfig.emailContacto}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    emailContacto: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Teléfono del Contacto */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Teléfono
              </label>
              <input
                type="tel"
                value={clinicConfig.telefonoContacto}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    telefonoContacto: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias del Sistema */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            <Globe className="w-5 h-5 text-purple-500" />
            Preferencias del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moneda */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Moneda del Sistema
              </label>
              <select
                value={clinicConfig.moneda}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    moneda: e.target.value,
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <option value="MXN">
                  MXN - Peso Mexicano ($)
                </option>
                <option value="USD">
                  USD - Dólar Estadounidense ($)
                </option>
                <option value="COP">
                  COP - Peso Colombiano ($)
                </option>
                <option value="ARS">
                  ARS - Peso Argentino ($)
                </option>
                <option value="CLP">
                  CLP - Peso Chileno ($)
                </option>
                <option value="PEN">
                  PEN - Sol Peruano (S/)
                </option>
                <option value="EUR">EUR - Euro (€)</option>
              </select>
              <p
                className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                Moneda utilizada en facturas, pagos y reportes
              </p>
            </div>

            {/* Formato de Horario */}
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Formato de Horario
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setClinicConfig({
                      ...clinicConfig,
                      formatoHorario: "12",
                    })
                  }
                  disabled={!editMode}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                    clinicConfig.formatoHorario === "12"
                      ? "border-purple-500 bg-purple-500 text-white"
                      : darkMode
                        ? "border-gray-700 bg-gray-900 text-gray-400 hover:border-purple-500"
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:border-purple-500"
                  } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">12 Horas</span>
                    <p className="text-xs opacity-75 mt-1">
                      3:30 PM
                    </p>
                  </div>
                </button>
                <button
                  onClick={() =>
                    setClinicConfig({
                      ...clinicConfig,
                      formatoHorario: "24",
                    })
                  }
                  disabled={!editMode}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                    clinicConfig.formatoHorario === "24"
                      ? "border-purple-500 bg-purple-500 text-white"
                      : darkMode
                        ? "border-gray-700 bg-gray-900 text-gray-400 hover:border-purple-500"
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:border-purple-500"
                  } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">24 Horas</span>
                    <p className="text-xs opacity-75 mt-1">
                      15:30
                    </p>
                  </div>
                </button>
              </div>
              <p
                className={`text-xs mt-2 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
              >
                Formato usado en agenda, citas y reportes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferencias de Notificaciones */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            <Bell className="w-5 h-5 text-yellow-500" />
            Preferencias de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Email Notifications */}
            <div>
              <h3
                className={`font-bold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Notificaciones por Email
              </h3>
              <div className="space-y-3">
                {Object.entries(clinicConfig.notificaciones)
                  .filter(([key]) => key.startsWith("email"))
                  .map(([key, value]) => {
                    const labels: Record<string, string> = {
                      emailNuevaSolicitudAceptada:
                        "Solicitud aceptada por el especialista",
                      emailNuevaSolicitudRechazada:
                        "Solicitud rechazada",
                      emailRecordatorioServicio:
                        "Recordatorio de servicio próximo",
                      emailNuevaFactura:
                        "Nueva factura generada",
                      emailRecordatorioPago:
                        "Recordatorio de pago pendiente",
                    };

                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setClinicConfig({
                              ...clinicConfig,
                              notificaciones: {
                                ...clinicConfig.notificaciones,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          disabled={!editMode}
                          className="w-5 h-5 rounded border-2 border-orange-500 text-orange-500 focus:ring-orange-500 disabled:opacity-60"
                        />
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {labels[key]}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>

            {/* SMS Notifications */}
            <div>
              <h3
                className={`font-bold mb-3 mt-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Notificaciones por SMS
              </h3>
              <div className="space-y-3">
                {Object.entries(clinicConfig.notificaciones)
                  .filter(([key]) => key.startsWith("sms"))
                  .map(([key, value]) => {
                    const labels: Record<string, string> = {
                      smsRecordatorioServicio:
                        "Recordatorio de servicio próximo",
                      smsFacturaGenerada:
                        "Nueva factura generada",
                    };

                    return (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setClinicConfig({
                              ...clinicConfig,
                              notificaciones: {
                                ...clinicConfig.notificaciones,
                                [key]: e.target.checked,
                              },
                            })
                          }
                          disabled={!editMode}
                          className="w-5 h-5 rounded border-2 border-orange-500 text-orange-500 focus:ring-orange-500 disabled:opacity-60"
                        />
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {labels[key]}
                        </span>
                      </label>
                    );
                  })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horario de Contacto */}
      <Card
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center gap-2 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            <Clock className="w-5 h-5 text-green-500" />
            Horario de Contacto Preferido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Horario en el que prefieres recibir llamadas del
            especialista
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Hora de Inicio
              </label>
              <input
                type="time"
                value={clinicConfig.horarioContacto.inicio}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    horarioContacto: {
                      ...clinicConfig.horarioContacto,
                      inicio: e.target.value,
                    },
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Hora de Fin
              </label>
              <input
                type="time"
                value={clinicConfig.horarioContacto.fin}
                onChange={(e) =>
                  setClinicConfig({
                    ...clinicConfig,
                    horarioContacto: {
                      ...clinicConfig.horarioContacto,
                      fin: e.target.value,
                    },
                  })
                }
                disabled={!editMode}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                  darkMode
                    ? "bg-gray-900 border-gray-700 text-white focus:border-orange-500"
                    : "bg-gray-50 border-gray-300 text-gray-900 focus:border-orange-500"
                } ${!editMode ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Agregar/Editar Usuario */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
              darkMode
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2
                className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {editingUser
                  ? "Editar Usuario"
                  : "Agregar Nuevo Usuario"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={formUsuario.nombre}
                      onChange={(e) =>
                        setFormUsuario({
                          ...formUsuario,
                          nombre: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={formUsuario.apellido}
                      onChange={(e) =>
                        setFormUsuario({
                          ...formUsuario,
                          apellido: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formUsuario.email}
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        email: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formUsuario.telefono}
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        telefono: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Rol *
                  </label>
                  <select
                    value={formUsuario.rol}
                    onChange={(e) =>
                      setFormUsuario({
                        ...formUsuario,
                        rol: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-blue-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-500"
                    }`}
                  >
                    {Object.entries(rolesClinica).map(
                      ([key, rol]) => (
                        <option key={key} value={key}>
                          {rol.nombre} - {rol.descripcion}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* Selección de Sedes */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Asignar Sedes
                  </label>
                  <div
                    className={`p-4 rounded-lg border-2 ${darkMode ? "bg-gray-900/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                  >
                    {sedes.length === 0 ? (
                      <div className="text-center py-2 text-gray-500">
                        No hay sedes registradas. <br />
                        <span className="text-xs">
                          Ve a "Gestión de Sedes" para crear
                          una.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              formUsuario.sedesIds.length === 0
                            }
                            onChange={() =>
                              setFormUsuario({
                                ...formUsuario,
                                sedesIds: [],
                              })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span
                            className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            Todas las sedes (Acceso Global)
                          </span>
                        </label>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {sedes
                            .filter((s) => s.activo)
                            .map((sede) => (
                              <label
                                key={sede.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formUsuario.sedesIds.includes(
                                    sede.id,
                                  )}
                                  onChange={(e) => {
                                    const newSedesIds = e.target
                                      .checked
                                      ? [
                                          ...formUsuario.sedesIds,
                                          sede.id,
                                        ]
                                      : formUsuario.sedesIds.filter(
                                          (id) =>
                                            id !== sede.id,
                                        );
                                    setFormUsuario({
                                      ...formUsuario,
                                      sedesIds: newSedesIds,
                                    });
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span
                                  className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                                >
                                  {sede.nombre}
                                </span>
                              </label>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * Si no seleccionas ninguna sede específica
                    (o seleccionas "Todas"), el usuario tendrá
                    acceso a toda la información.
                  </p>
                </div>

                {/* Mostrar permisos del rol seleccionado */}
                <div
                  className={`p-4 rounded-lg ${darkMode ? "bg-gray-900/50" : "bg-gray-100"}`}
                >
                  <p
                    className={`text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Permisos de{" "}
                    {rolesClinica[formUsuario.rol]?.nombre}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rolesClinica[formUsuario.rol] &&
                      Object.entries(
                        rolesClinica[formUsuario.rol].permisos,
                      ).map(
                        ([modulo, tiene]) =>
                          tiene && (
                            <Badge
                              key={modulo}
                              className="text-white font-bold"
                              style={{
                                backgroundColor:
                                  rolesClinica[formUsuario.rol]
                                    .color,
                              }}
                            >
                              {
                                modulosLabels[
                                  modulo as keyof typeof modulosLabels
                                ]
                              }
                            </Badge>
                          ),
                      )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarUsuario}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                    boxShadow:
                      "0 4px 16px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  {editingUser
                    ? "Guardar Cambios"
                    : "Crear Usuario"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Crear/Editar Rol */}
      {showRolModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-3xl rounded-2xl shadow-2xl my-8 ${
              darkMode
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-white"
            }`}
          >
            <div className="p-6">
              <h2
                className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {editingRol
                  ? "Editar Rol Personalizado"
                  : "Crear Nuevo Rol"}
              </h2>

              <div className="space-y-6">
                {/* Información básica del rol */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Nombre del Rol *
                    </label>
                    <input
                      type="text"
                      value={formRol.nombre}
                      onChange={(e) =>
                        setFormRol({
                          ...formRol,
                          nombre: e.target.value,
                        })
                      }
                      placeholder="ej. Supervisor"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        darkMode
                          ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500"
                          : "bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Color del Rol *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formRol.color}
                        onChange={(e) =>
                          setFormRol({
                            ...formRol,
                            color: e.target.value,
                          })
                        }
                        className="w-16 h-12 rounded-lg border-2 cursor-pointer"
                      />
                      <select
                        value={formRol.color}
                        onChange={(e) =>
                          setFormRol({
                            ...formRol,
                            color: e.target.value,
                          })
                        }
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                          darkMode
                            ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500"
                            : "bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500"
                        }`}
                      >
                        {coloresDisponibles.map((color) => (
                          <option
                            key={color.valor}
                            value={color.valor}
                          >
                            {color.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Descripción
                  </label>
                  <textarea
                    value={formRol.descripcion}
                    onChange={(e) =>
                      setFormRol({
                        ...formRol,
                        descripcion: e.target.value,
                      })
                    }
                    placeholder="Describe las responsabilidades de este rol..."
                    rows={2}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all resize-none ${
                      darkMode
                        ? "bg-gray-900 border-gray-700 text-white focus:border-purple-500"
                        : "bg-gray-50 border-gray-300 text-gray-900 focus:border-purple-500"
                    }`}
                  />
                </div>

                {/* Matriz de permisos interactiva */}
                <div>
                  <h3
                    className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Selecciona los Permisos
                  </h3>
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      darkMode
                        ? "bg-gray-900/50 border-gray-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="space-y-3">
                      {Object.entries(modulosLabels).map(
                        ([moduloKey, moduloLabel]) => (
                          <label
                            key={moduloKey}
                            className={`flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-all ${
                              formRol.permisos[
                                moduloKey as keyof typeof formRol.permisos
                              ]
                                ? darkMode
                                  ? "bg-purple-500/20 border-2 border-purple-500"
                                  : "bg-purple-100 border-2 border-purple-300"
                                : darkMode
                                  ? "bg-gray-800 hover:bg-gray-700"
                                  : "bg-white hover:bg-gray-100"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={
                                formRol.permisos[
                                  moduloKey as keyof typeof formRol.permisos
                                ]
                              }
                              onChange={() =>
                                handleTogglePermiso(
                                  moduloKey as keyof typeof formRol.permisos,
                                )
                              }
                              className="w-6 h-6 mt-1 rounded border-2 border-purple-500 text-purple-500 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                                >
                                  {moduloLabel}
                                </span>
                                {formRol.permisos[
                                  moduloKey as keyof typeof formRol.permisos
                                ] && (
                                  <Badge className="bg-purple-500 text-white text-xs">
                                    Permitido
                                  </Badge>
                                )}
                              </div>
                              <p
                                className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                              >
                                {
                                  modulosDescripciones[
                                    moduloKey
                                  ]
                                }
                              </p>
                            </div>
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview del rol */}
                <div
                  className={`p-4 rounded-xl ${darkMode ? "bg-gray-900/50" : "bg-gray-100"}`}
                >
                  <p
                    className={`text-sm font-semibold mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Vista Previa:
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge
                      className="font-bold text-white text-lg px-4 py-2"
                      style={{ backgroundColor: formRol.color }}
                    >
                      {formRol.nombre || "Nombre del Rol"}
                    </Badge>
                    <span
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    >
                      {formRol.descripcion || "Sin descripción"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(formRol.permisos).map(
                      ([modulo, tiene]) =>
                        tiene && (
                          <Badge
                            key={modulo}
                            className="text-white font-bold"
                            style={{
                              backgroundColor: formRol.color,
                            }}
                          >
                            {
                              modulosLabels[
                                modulo as keyof typeof modulosLabels
                              ]
                            }
                          </Badge>
                        ),
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRolModal(false)}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                    darkMode
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarRol}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                    boxShadow:
                      "0 4px 16px rgba(139, 92, 246, 0.4)",
                  }}
                >
                  {editingRol ? "Guardar Cambios" : "Crear Rol"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}