import { useState } from 'react';
import { useApp } from '../App';
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  Mail, 
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  Save,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

export function Usuarios() {
  const { darkMode, usuarios, setUsuarios, roles } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    rol: 'medico',
    activo: true
  });

  const filteredUsers = usuarios.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'todos' || user.rol === filterRole;
    const matchesStatus = filterStatus === 'todos' || 
                         (filterStatus === 'activo' && user.activo) ||
                         (filterStatus === 'inactivo' && !user.activo);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        especialidad: user.especialidad || '',
        rol: user.rol,
        activo: user.activo
      });
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        especialidad: '',
        rol: 'medico',
        activo: true
      });
    }
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsuarios(usuarios.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
    } else {
      const newUser = {
        id: usuarios.length + 1,
        ...formData,
        fechaRegistro: new Date().toISOString().split('T')[0]
      };
      setUsuarios([...usuarios, newUser]);
    }
    setShowModal(false);
    setEditingUser(null);
  };

  const toggleUserStatus = (userId: number) => {
    setUsuarios(usuarios.map(u => 
      u.id === userId ? { ...u, activo: !u.activo } : u
    ));
  };

  const deleteUser = (userId: number) => {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      setUsuarios(usuarios.filter(u => u.id !== userId));
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: any = {
      'admin': 'bg-gradient-to-r from-red-500 to-pink-500',
      'medico': 'bg-gradient-to-r from-blue-500 to-cyan-500',
      'asistente': 'bg-gradient-to-r from-green-500 to-emerald-500',
      'contador': 'bg-gradient-to-r from-purple-500 to-indigo-500',
      'lectura': 'bg-gradient-to-r from-gray-500 to-slate-500'
    };
    return colors[roleName] || 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  const getRoleInfo = (roleName: string) => {
    return roles.find(r => r.id === roleName);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Usuarios
          </h1>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Administra usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles y Permisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-6">
          {/* Filtros */}
          <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Lista de usuarios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map(user => {
              const roleInfo = getRoleInfo(user.rol);
              return (
                <Card 
                  key={user.id}
                  className={`p-5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-xl transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${getRoleBadgeColor(user.rol)} flex items-center justify-center text-white`}>
                        {user.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.nombre}
                        </h3>
                        {user.especialidad && (
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {user.especialidad}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getRoleBadgeColor(user.rol)} text-white border-0`}>
                      {roleInfo?.nombre || user.rol}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.telefono}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {user.activo ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedUser(user)}
                        className={darkMode ? 'text-gray-300 hover:text-white' : ''}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenModal(user)}
                        className={darkMode ? 'text-gray-300 hover:text-white' : ''}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleUserStatus(user.id)}
                        className={darkMode ? 'text-gray-300 hover:text-white' : ''}
                      >
                        {user.activo ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteUser(user.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RolesManager darkMode={darkMode} />
        </TabsContent>
      </Tabs>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Nombre Completo</Label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Dr. Juan Pérez"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="juan.perez@ejemplo.com"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Teléfono</Label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+1234567890"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Especialidad</Label>
                  <Input
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    placeholder="Cardiología Veterinaria"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={darkMode ? 'text-gray-300' : ''}>Rol</Label>
                  <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
                    <SelectTrigger className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.activo}
                    onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
                  />
                  <Label className={darkMode ? 'text-gray-300' : ''}>Usuario Activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveUser}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de detalles del usuario */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Detalles del Usuario
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                  className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div className={`w-20 h-20 rounded-full ${getRoleBadgeColor(selectedUser.rol)} flex items-center justify-center text-white text-2xl`}>
                  {selectedUser.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.nombre}
                  </h3>
                  {selectedUser.especialidad && (
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedUser.especialidad}
                    </p>
                  )}
                  <Badge className={`${getRoleBadgeColor(selectedUser.rol)} text-white border-0 mt-2`}>
                    {getRoleInfo(selectedUser.rol)?.nombre}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</Label>
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{selectedUser.email}</p>
                </div>
                <div>
                  <Label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Teléfono</Label>
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{selectedUser.telefono}</p>
                </div>
                <div>
                  <Label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Estado</Label>
                  <div className="mt-1">
                    {selectedUser.activo ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fecha de Registro</Label>
                  <p className={`${darkMode ? 'text-white' : 'text-gray-900'} mt-1`}>{selectedUser.fechaRegistro}</p>
                </div>

                {/* Permisos del rol */}
                <div>
                  <Label className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-3 block`}>Permisos Asignados</Label>
                  <PermisosVisualization roleId={selectedUser.rol} darkMode={darkMode} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setSelectedUser(null)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Componente para gestionar roles
function RolesManager({ darkMode }: { darkMode: boolean }) {
  const { roles, setRoles } = useApp();
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const modulos = [
    { id: 'dashboard', nombre: 'Dashboard', permisos: ['ver'] },
    { id: 'solicitudes', nombre: 'Solicitudes', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'agenda', nombre: 'Agenda', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'servicios', nombre: 'Servicios', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'facturacion', nombre: 'Facturación', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'finanzas', nombre: 'Finanzas', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'clinicas', nombre: 'Clínicas', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'usuarios', nombre: 'Usuarios', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'pacientes', nombre: 'Pacientes', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'reportes', nombre: 'Reportes', permisos: ['ver', 'exportar'] },
    { id: 'interconsultas', nombre: 'Interconsultas', permisos: ['ver', 'crear', 'responder'] },
    { id: 'configuraciones', nombre: 'Configuraciones', permisos: ['ver', 'editar'] },
    { id: 'perfil', nombre: 'Perfil', permisos: ['ver', 'editar'] }
  ];

  const togglePermiso = (moduloId: string, permiso: string) => {
    const updatedRoles = roles.map(role => {
      if (role.id === selectedRole.id) {
        const permisos = { ...role.permisos };
        if (!permisos[moduloId]) {
          permisos[moduloId] = [];
        }
        if (permisos[moduloId].includes(permiso)) {
          permisos[moduloId] = permisos[moduloId].filter(p => p !== permiso);
        } else {
          permisos[moduloId] = [...permisos[moduloId], permiso];
        }
        const updatedRole = { ...role, permisos };
        // Actualizar también el selectedRole
        setSelectedRole(updatedRole);
        return updatedRole;
      }
      return role;
    });
    setRoles(updatedRoles);
    
    // Mostrar mensaje de guardado
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 2000);
  };

  const hasPermiso = (moduloId: string, permiso: string) => {
    return selectedRole.permisos[moduloId]?.includes(permiso) || false;
  };

  const createRole = () => {
    if (!newRoleName.trim()) return;
    
    const newRole = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '_'),
      nombre: newRoleName,
      descripcion: newRoleDesc,
      permisos: {}
    };
    
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setShowCreateRole(false);
    setNewRoleName('');
    setNewRoleDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Roles
          </h2>
          <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Configura los permisos para cada rol del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          {showSavedMessage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg border border-green-500/30 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm">Permisos guardados</span>
            </div>
          )}
          <Button
            onClick={() => setShowCreateRole(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Shield className="w-4 h-4 mr-2" />
            Crear Rol
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Lista de roles */}
        <Card className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className={`mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Roles Disponibles
          </h3>
          <div className="space-y-2">
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedRole.id === role.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : darkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>{role.nombre}</span>
                </div>
                <p className={`text-xs mt-1 ${
                  selectedRole.id === role.id 
                    ? 'text-white/80' 
                    : darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {role.descripcion}
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Matriz de permisos */}
        <Card className={`lg:col-span-3 p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="mb-6">
            <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {selectedRole.nombre}
            </h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {selectedRole.descripcion}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              💡 Marca o desmarca los permisos. Los cambios se guardan automáticamente.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Módulo
                  </th>
                  <th className={`text-center p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ver
                  </th>
                  <th className={`text-center p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Crear
                  </th>
                  <th className={`text-center p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Editar
                  </th>
                  <th className={`text-center p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Eliminar
                  </th>
                  <th className={`text-center p-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Exportar
                  </th>
                </tr>
              </thead>
              <tbody>
                {modulos.map(modulo => (
                  <tr 
                    key={modulo.id}
                    className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors`}
                  >
                    <td className={`p-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {modulo.nombre}
                    </td>
                    {['ver', 'crear', 'editar', 'eliminar', 'exportar'].map(permiso => (
                      <td key={permiso} className="text-center p-3">
                        {modulo.permisos.includes(permiso) ? (
                          <input
                            type="checkbox"
                            checked={hasPermiso(modulo.id, permiso)}
                            onChange={() => togglePermiso(modulo.id, permiso)}
                            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                          />
                        ) : (
                          <span className={darkMode ? 'text-gray-700' : 'text-gray-300'}>—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal crear rol */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className={`w-full max-w-md ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Crear Nuevo Rol
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateRole(false)}
                  className={darkMode ? 'text-gray-400 hover:text-white' : ''}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Nombre del Rol</Label>
                  <Input
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Supervisor"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
                <div>
                  <Label className={darkMode ? 'text-gray-300' : ''}>Descripción</Label>
                  <Input
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Supervisa operaciones diarias"
                    className={darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateRole(false)}
                  className={darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-900' : ''}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createRole}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Crear Rol
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Componente para visualizar permisos de un rol
function PermisosVisualization({ roleId, darkMode }: { roleId: string, darkMode: boolean }) {
  const { roles } = useApp();
  const role = roles.find(r => r.id === roleId);

  if (!role) return null;

  const modulos = [
    { id: 'dashboard', nombre: 'Dashboard', permisos: ['ver'] },
    { id: 'solicitudes', nombre: 'Solicitudes', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'agenda', nombre: 'Agenda', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'servicios', nombre: 'Servicios', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'facturacion', nombre: 'Facturación', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'finanzas', nombre: 'Finanzas', permisos: ['ver', 'crear', 'editar', 'eliminar', 'exportar'] },
    { id: 'clinicas', nombre: 'Clínicas', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'usuarios', nombre: 'Usuarios', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'pacientes', nombre: 'Pacientes', permisos: ['ver', 'crear', 'editar', 'eliminar'] },
    { id: 'reportes', nombre: 'Reportes', permisos: ['ver', 'exportar'] },
    { id: 'interconsultas', nombre: 'Interconsultas', permisos: ['ver', 'crear', 'responder'] },
    { id: 'configuraciones', nombre: 'Configuraciones', permisos: ['ver', 'editar'] },
    { id: 'perfil', nombre: 'Perfil', permisos: ['ver', 'editar'] }
  ];

  return (
    <div className="space-y-2">
      {modulos.map(modulo => {
        const permisos = role.permisos[modulo] || [];
        if (permisos.length === 0) return null;

        return (
          <div 
            key={modulo}
            className={`p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
          >
            <span className={`capitalize ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {modulo}:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {permisos.map((permiso: string) => (
                <Badge 
                  key={permiso}
                  className={`${darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'} border-0`}
                >
                  {permiso}
                </Badge>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}