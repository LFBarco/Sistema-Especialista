import React, { useState } from 'react';
import { useApp, Sede } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import * as API from '../utils/api';

export function GestionSedes() {
  const { sedes, setSedes, darkMode, userClinicas } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<Sede>>({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    clinicaId: userClinicas[0]?.id || '',
    encargado: '',
    activo: true
  });

  const filteredSedes = sedes.filter(sede => 
    sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sede.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (sede?: Sede) => {
    if (sede) {
      setEditingSede(sede);
      setFormData(sede);
    } else {
      setEditingSede(null);
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        telefono: '',
        clinicaId: userClinicas[0]?.id || '',
        encargado: '',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.nombre || !formData.direccion || !formData.ciudad) {
        toast.error('Por favor completa los campos obligatorios');
        return;
      }

      if (editingSede) {
        // Update existing
        const updatedSede = { ...formData, id: editingSede.id } as Sede;
        await API.sedesAPI.update(updatedSede.id, updatedSede);
        
        setSedes(sedes.map(s => s.id === updatedSede.id ? updatedSede : s));
        toast.success('Sede actualizada correctamente');
      } else {
        // Create new
        const newSede = {
          ...formData,
          id: Date.now().toString(),
          activo: true
        } as Sede;
        
        await API.sedesAPI.create(newSede);
        setSedes([...sedes, newSede]);
        toast.success('Sede creada correctamente');
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving sede:', error);
      toast.error('Ocurrió un error al guardar la sede');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta sede?')) {
      try {
        await API.sedesAPI.delete(id);
        setSedes(sedes.filter(s => s.id !== id));
        toast.success('Sede eliminada correctamente');
      } catch (error) {
        console.error('Error deleting sede:', error);
        toast.error('Error al eliminar la sede');
      }
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Sedes
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Administra las ubicaciones físicas de tu clínica veterinaria
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Sede
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Buscar por nombre o ciudad..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSedes.map((sede) => (
          <Card key={sede.id} className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-shadow duration-300`}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'}`}>
                  <Building2 className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {sede.nombre}
                  </CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {sede.ciudad}
                  </p>
                </div>
              </div>
              <Badge variant={sede.activo ? "default" : "destructive"} className={sede.activo ? "bg-green-500 hover:bg-green-600" : ""}>
                {sede.activo ? "Activa" : "Inactiva"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {sede.direccion}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {sede.telefono}
                  </span>
                </div>

                {sede.encargado && (
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      Encargado: <span className="font-medium">{sede.encargado}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
                  onClick={() => handleOpenModal(sede)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="dark:bg-gray-900 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/20 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => handleDelete(sede.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Card para añadir nueva sede */}
        <button 
          onClick={() => handleOpenModal()}
          className={`flex flex-col items-center justify-center h-full min-h-[250px] rounded-xl border-2 border-dashed transition-all duration-300 group
            ${darkMode 
              ? 'border-gray-700 hover:border-orange-500 hover:bg-gray-800/50' 
              : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50/50'
            }`}
        >
          <div className={`p-4 rounded-full mb-4 transition-transform group-hover:scale-110 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
            <Plus className="w-8 h-8" />
          </div>
          <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'} group-hover:text-orange-500`}>
            Añadir Nueva Sede
          </h3>
        </button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={darkMode ? 'bg-gray-900 border-gray-800 text-white' : ''}>
          <DialogHeader>
            <DialogTitle>{editingSede ? 'Editar Sede' : 'Nueva Sede'}</DialogTitle>
            <DialogDescription>
              {editingSede ? 'Modifica los datos de la sede existente.' : 'Ingresa los datos para registrar una nueva sede.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className={`col-span-3 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                placeholder="Ej. Sede Norte"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ciudad" className="text-right">Ciudad</Label>
              <Input
                id="ciudad"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className={`col-span-3 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                placeholder="Ej. Bogotá"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className={`col-span-3 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                placeholder="Calle 123 # 45-67"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className={`col-span-3 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                placeholder="+57 300 123 4567"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="encargado" className="text-right">Encargado</Label>
              <Input
                id="encargado"
                value={formData.encargado}
                onChange={(e) => setFormData({ ...formData, encargado: e.target.value })}
                className={`col-span-3 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}
                placeholder="Nombre del encargado"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
              {editingSede ? 'Guardar Cambios' : 'Crear Sede'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
