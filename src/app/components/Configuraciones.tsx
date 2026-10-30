import { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Check, X, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { ConfiguracionAgenda } from './ConfiguracionAgenda';
import { ThemePicker } from './ThemePicker';
import { toast } from 'sonner';
import { systemAPI } from '../utils/api';

interface ConfigItem {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  orden?: number;
  metadata?: any;
}

interface ConfigCategoria {
  items: ConfigItem[];
  campos?: string[];
}

export function Configuraciones() {
  const { darkMode, configServicios, setConfigServicios } = useApp();
  const [tabActual, setTabActual] = useState('agenda');
  const [editando, setEditando] = useState<{ categoria: string; id: number } | null>(null);
  const [agregando, setAgregando] = useState<string | null>(null);

  // Estados de configuración
  // (tiposServicios ahora viene del contexto)

  const [especialidades, setEspecialidades] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Cardiología', activo: true },
    { id: 2, nombre: 'Dermatología', activo: true },
    { id: 3, nombre: 'Oftalmología', activo: true },
    { id: 4, nombre: 'Ortopedia', activo: true },
    { id: 5, nombre: 'Neurología', activo: true },
    { id: 6, nombre: 'Oncología', activo: true }
  ]);

  const [categoriasGastos, setCategoriasGastos] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Equipo Médico', activo: true },
    { id: 2, nombre: 'Material Médico', activo: true },
    { id: 3, nombre: 'Transporte', activo: true },
    { id: 4, nombre: 'Servicios Profesionales', activo: true },
    { id: 5, nombre: 'Administrativos', activo: true },
    { id: 6, nombre: 'Otros', activo: true }
  ]);

  const [metodosPago, setMetodosPago] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Efectivo', activo: true },
    { id: 2, nombre: 'Tarjeta de Crédito', activo: true },
    { id: 3, nombre: 'Tarjeta de Débito', activo: true },
    { id: 4, nombre: 'Transferencia Bancaria', activo: true },
    { id: 5, nombre: 'SINPE Móvil', activo: true },
    { id: 6, nombre: 'Cheque', activo: true }
  ]);

  const [especies, setEspecies] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Canino', activo: true },
    { id: 2, nombre: 'Felino', activo: true },
    { id: 3, nombre: 'Ave', activo: true },
    { id: 4, nombre: 'Roedor', activo: true },
    { id: 5, nombre: 'Reptil', activo: true },
    { id: 6, nombre: 'Equino', activo: true },
    { id: 7, nombre: 'Bovino', activo: true },
    { id: 8, nombre: 'Porcino', activo: true }
  ]);

  const [razasCaninas, setRazasCaninas] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Labrador Retriever', activo: true },
    { id: 2, nombre: 'Golden Retriever', activo: true },
    { id: 3, nombre: 'Pastor Alemán', activo: true },
    { id: 4, nombre: 'Bulldog', activo: true },
    { id: 5, nombre: 'Beagle', activo: true },
    { id: 6, nombre: 'Poodle', activo: true },
    { id: 7, nombre: 'Chihuahua', activo: true },
    { id: 8, nombre: 'Yorkshire Terrier', activo: true },
    { id: 9, nombre: 'Mestizo', activo: true }
  ]);

  const [razasFelinas, setRazasFelinas] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Persa', activo: true },
    { id: 2, nombre: 'Siamés', activo: true },
    { id: 3, nombre: 'Maine Coon', activo: true },
    { id: 4, nombre: 'Británico de Pelo Corto', activo: true },
    { id: 5, nombre: 'Bengalí', activo: true },
    { id: 6, nombre: 'Ragdoll', activo: true },
    { id: 7, nombre: 'Común Europeo', activo: true },
    { id: 8, nombre: 'Mestizo', activo: true }
  ]);

  const [diagnosticos, setDiagnosticos] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Gastroenteritis aguda', descripcion: 'Inflamación del tracto gastrointestinal', activo: true, metadata: { codigo: 'K29.0' } },
    { id: 2, nombre: 'Otitis externa', descripcion: 'Inflamación del oído externo', activo: true, metadata: { codigo: 'H60.9' } },
    { id: 3, nombre: 'Dermatitis alérgica', descripcion: 'Reacción alérgica en la piel', activo: true, metadata: { codigo: 'L23.9' } },
    { id: 4, nombre: 'Insuficiencia cardíaca congestiva', descripcion: 'Falla del corazón para bombear sangre', activo: true, metadata: { codigo: 'I50.9' } },
    { id: 5, nombre: 'Diabetes mellitus', descripcion: 'Trastorno del metabolismo de la glucosa', activo: true, metadata: { codigo: 'E14.9' } },
    { id: 6, nombre: 'Enfermedad renal crónica', descripcion: 'Deterioro progresivo de la función renal', activo: true, metadata: { codigo: 'N18.9' } },
    { id: 7, nombre: 'Displasia de cadera', descripcion: 'Malformación de la articulación de cadera', activo: true, metadata: { codigo: 'M24.85' } },
    { id: 8, nombre: 'Parvovirosis canina', descripcion: 'Infección viral gastrointestinal', activo: true, metadata: { codigo: 'A08.3' } }
  ]);

  const [medicamentos, setMedicamentos] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Amoxicilina', descripcion: 'Antibiótico de amplio espectro', activo: true, metadata: { presentacion: 'Comprimidos 500mg' } },
    { id: 2, nombre: 'Meloxicam', descripcion: 'Antiinflamatorio no esteroideo', activo: true, metadata: { presentacion: 'Suspensión oral' } },
    { id: 3, nombre: 'Prednisolona', descripcion: 'Corticosteroide', activo: true, metadata: { presentacion: 'Comprimidos 5mg' } },
    { id: 4, nombre: 'Furosemida', descripcion: 'Diurético', activo: true, metadata: { presentacion: 'Comprimidos 40mg' } },
    { id: 5, nombre: 'Enalapril', descripcion: 'Inhibidor de la ECA para corazón', activo: true, metadata: { presentacion: 'Comprimidos 10mg' } },
    { id: 6, nombre: 'Metronidazol', descripcion: 'Antibiótico y antiparasitario', activo: true, metadata: { presentacion: 'Comprimidos 250mg' } },
    { id: 7, nombre: 'Apoquel', descripcion: 'Antiprurítico para alergias', activo: true, metadata: { presentacion: 'Comprimidos 16mg' } },
    { id: 8, nombre: 'Tramadol', descripcion: 'Analgésico opioide', activo: true, metadata: { presentacion: 'Comprimidos 50mg' } }
  ]);

  const [vacunas, setVacunas] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Séxtuple (DHPP)', descripcion: 'Protección contra 6 enfermedades caninas', activo: true, metadata: { especie: 'Canino', frecuencia: '1 año' } },
    { id: 2, nombre: 'Antirrábica', descripcion: 'Vacuna contra la rabia', activo: true, metadata: { especie: 'Ambos', frecuencia: '1 año' } },
    { id: 3, nombre: 'Triple Felina', descripcion: 'Protección contra 3 enfermedades felinas', activo: true, metadata: { especie: 'Felino', frecuencia: '1 año' } },
    { id: 4, nombre: 'Leucemia Felina (FeLV)', descripcion: 'Protección contra leucemia felina', activo: true, metadata: { especie: 'Felino', frecuencia: '1 año' } },
    { id: 5, nombre: 'Bordetella', descripcion: 'Protección contra tos de las perreras', activo: true, metadata: { especie: 'Canino', frecuencia: '6 meses' } },
    { id: 6, nombre: 'Leptospirosis', descripcion: 'Protección contra leptospira', activo: true, metadata: { especie: 'Canino', frecuencia: '1 año' } }
  ]);

  const [tiposHistoriaClinica, setTiposHistoriaClinica] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Consulta General', activo: true },
    { id: 2, nombre: 'Consulta de Urgencia', activo: true },
    { id: 3, nombre: 'Cirugía', activo: true },
    { id: 4, nombre: 'Hospitalización', activo: true },
    { id: 5, nombre: 'Control Post-operatorio', activo: true },
    { id: 6, nombre: 'Vacunación', activo: true },
    { id: 7, nombre: 'Desparasitación', activo: true },
    { id: 8, nombre: 'Examen de Laboratorio', activo: true },
    { id: 9, nombre: 'Estudio de Imagen', activo: true }
  ]);

  const [terminosPago, setTerminosPago] = useState<ConfigItem[]>([
    { id: 1, nombre: 'Inmediato', descripcion: 'Pago al momento de la prestación del servicio', activo: true, metadata: { dias: 0 } },
    { id: 2, nombre: 'Neto 15', descripcion: 'Pago a 15 días', activo: true, metadata: { dias: 15 } },
    { id: 3, nombre: 'Neto 30', descripcion: 'Pago a 30 días', activo: true, metadata: { dias: 30 } },
    { id: 4, nombre: 'Neto 45', descripcion: 'Pago a 45 días', activo: true, metadata: { dias: 45 } },
    { id: 5, nombre: 'Neto 60', descripcion: 'Pago a 60 días', activo: true, metadata: { dias: 60 } }
  ]);

  const [nuevoItem, setNuevoItem] = useState<Partial<ConfigItem>>({
    nombre: '',
    descripcion: '',
    activo: true,
    metadata: {}
  });

  // Mapeo de categorías
  const configuraciones: { [key: string]: { items: ConfigItem[]; setter: any; titulo: string; descripcion: string; campos?: string[] } } = {
    tiposServicios: {
      items: configServicios,
      setter: setConfigServicios,
      titulo: 'Tipos de Servicios',
      descripcion: 'Servicios veterinarios que ofreces',
      campos: ['nombre', 'descripcion', 'orden', 'precio']
    },
    especialidades: {
      items: especialidades,
      setter: setEspecialidades,
      titulo: 'Especialidades',
      descripcion: 'Especialidades veterinarias disponibles'
    },
    categoriasGastos: {
      items: categoriasGastos,
      setter: setCategoriasGastos,
      titulo: 'Categorías de Gastos',
      descripcion: 'Categorías para organizar tus gastos'
    },
    metodosPago: {
      items: metodosPago,
      setter: setMetodosPago,
      titulo: 'Métodos de Pago',
      descripcion: 'Formas de pago aceptadas'
    },
    especies: {
      items: especies,
      setter: setEspecies,
      titulo: 'Especies',
      descripcion: 'Especies de animales que atiendes'
    },
    razasCaninas: {
      items: razasCaninas,
      setter: setRazasCaninas,
      titulo: 'Razas Caninas',
      descripcion: 'Razas de perros más comunes'
    },
    razasFelinas: {
      items: razasFelinas,
      setter: setRazasFelinas,
      titulo: 'Razas Felinas',
      descripcion: 'Razas de gatos más comunes'
    },
    diagnosticos: {
      items: diagnosticos,
      setter: setDiagnosticos,
      titulo: 'Diagnósticos',
      descripcion: 'Diagnósticos veterinarios comunes',
      campos: ['nombre', 'descripcion', 'codigo']
    },
    medicamentos: {
      items: medicamentos,
      setter: setMedicamentos,
      titulo: 'Medicamentos',
      descripcion: 'Catálogo de medicamentos veterinarios',
      campos: ['nombre', 'descripcion', 'presentacion']
    },
    vacunas: {
      items: vacunas,
      setter: setVacunas,
      titulo: 'Vacunas',
      descripcion: 'Vacunas disponibles',
      campos: ['nombre', 'descripcion', 'especie', 'frecuencia']
    },
    tiposHistoriaClinica: {
      items: tiposHistoriaClinica,
      setter: setTiposHistoriaClinica,
      titulo: 'Tipos de Historia Clínica',
      descripcion: 'Tipos de consultas y procedimientos'
    },
    terminosPago: {
      items: terminosPago,
      setter: setTerminosPago,
      titulo: 'Términos de Pago',
      descripcion: 'Condiciones de pago para facturas',
      campos: ['nombre', 'descripcion', 'dias']
    }
  };

  // Funciones CRUD
  const agregarItem = (categoria: string) => {
    const config = configuraciones[categoria];
    if (!nuevoItem.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    const newItem: ConfigItem = {
      id: config.items.length + 1,
      nombre: nuevoItem.nombre,
      descripcion: nuevoItem.descripcion,
      activo: nuevoItem.activo ?? true,
      orden: nuevoItem.orden,
      metadata: nuevoItem.metadata
    };

    config.setter([...config.items, newItem]);
    setAgregando(null);
    setNuevoItem({ nombre: '', descripcion: '', activo: true, metadata: {} });
  };

  const actualizarItem = (categoria: string, id: number, cambios: Partial<ConfigItem>) => {
    const config = configuraciones[categoria];
    config.setter(config.items.map((item: ConfigItem) =>
      item.id === id ? { ...item, ...cambios } : item
    ));
  };

  const toggleActivo = (categoria: string, id: number) => {
    const config = configuraciones[categoria];
    config.setter(config.items.map((item: ConfigItem) =>
      item.id === id ? { ...item, activo: !item.activo } : item
    ));
  };

  const eliminarItem = (categoria: string, id: number) => {
    const config = configuraciones[categoria];
    if (confirm('¿Estás seguro de eliminar este elemento?')) {
      config.setter(config.items.filter((item: ConfigItem) => item.id !== id));
    }
  };

  const [asignandoDatos, setAsignandoDatos] = useState(false);

  const handleAsignarDatosAntiguos = async () => {
    if (!window.confirm('Los registros antiguos sin dueño (clínicas, servicios, facturas, gastos, etc.) pasarán a ser tuyos y dejarán de verse en las cuentas de otros especialistas.\n\n¿Continuar?')) return;
    setAsignandoDatos(true);
    try {
      const resultado = await systemAPI.asignarDatosAntiguos();
      const total = resultado?.total ?? 0;
      toast.success(total > 0
        ? `Se asignaron ${total} registros a tu cuenta`
        : 'No había registros antiguos sin dueño');
    } catch (error) {
      console.error(error);
      toast.error(String(error).includes('403')
        ? 'Solo un administrador puede hacer esta acción'
        : 'No se pudieron asignar los registros');
    } finally {
      setAsignandoDatos(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('¡ADVERTENCIA DE SEGURIDAD!\n\nEsta acción eliminará TODOS los datos de la base de datos:\n- Pacientes\n- Citas\n- Facturas\n- Usuarios\n- Configuración\n\n¿Estás absolutamente seguro de que deseas continuar?')) {
      if (window.confirm('ÚLTIMA ADVERTENCIA: Esta acción es irreversible y dejará el sistema en blanco.\n\nPresiona Aceptar para borrar todo.')) {
        try {
          toast.loading('Eliminando todos los datos...');
          await systemAPI.resetData();
          toast.dismiss();
          toast.success('Sistema reseteado correctamente. Recarga la página.');
          setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
          toast.dismiss();
          console.error(error);
          toast.error(String(error).includes('403')
            ? 'Solo un administrador puede resetear el sistema'
            : 'Error al resetear el sistema');
        }
      }
    }
  };

  const TablaConfiguracion = ({ categoria }: { categoria: string }) => {
    const config = configuraciones[categoria];
    const itemsOrdenados = [...config.items].sort((a, b) => (a.orden || 0) - (b.orden || 0));

    return (
      <Card className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <div>
            <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {config.titulo}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.descripcion}
            </p>
          </div>
          <Button
            onClick={() => setAgregando(categoria)}
            className="bg-brand hover:bg-brand-hover text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {itemsOrdenados.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'} flex items-center justify-between`}
              >
                <div className="flex-1">
                  {editando?.categoria === categoria && editando?.id === item.id ? (
                    <div className="space-y-3">
                      <Input
                        value={item.nombre}
                        onChange={(e) => actualizarItem(categoria, item.id, { nombre: e.target.value })}
                        className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                      />
                      {config.campos?.includes('descripcion') && (
                        <Textarea
                          value={item.descripcion || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, { descripcion: e.target.value })}
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                          rows={2}
                        />
                      )}
                      {config.campos?.includes('codigo') && (
                        <Input
                          value={item.metadata?.codigo || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, {
                            metadata: { ...item.metadata, codigo: e.target.value }
                          })}
                          placeholder="Código"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                      {config.campos?.includes('presentacion') && (
                        <Input
                          value={item.metadata?.presentacion || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, {
                            metadata: { ...item.metadata, presentacion: e.target.value }
                          })}
                          placeholder="Presentación"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                      {config.campos?.includes('especie') && (
                        <Input
                          value={item.metadata?.especie || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, {
                            metadata: { ...item.metadata, especie: e.target.value }
                          })}
                          placeholder="Especie"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                      {config.campos?.includes('frecuencia') && (
                        <Input
                          value={item.metadata?.frecuencia || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, {
                            metadata: { ...item.metadata, frecuencia: e.target.value }
                          })}
                          placeholder="Frecuencia"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                      {config.campos?.includes('dias') && (
                        <Input
                          type="number"
                          value={item.metadata?.dias || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, {
                            metadata: { ...item.metadata, dias: parseInt(e.target.value) }
                          })}
                          placeholder="Días"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                      {config.campos?.includes('precio') && (
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500 text-xs">S/</span>
                          <Input
                            type="number"
                            value={item.metadata?.precio || ''}
                            onChange={(e) => actualizarItem(categoria, item.id, {
                              metadata: { ...item.metadata, precio: parseInt(e.target.value) }
                            })}
                            placeholder="Precio"
                            className={`pl-6 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}
                          />
                        </div>
                      )}
                      {config.campos?.includes('orden') && (
                        <Input
                          type="number"
                          value={item.orden || ''}
                          onChange={(e) => actualizarItem(categoria, item.id, { orden: parseInt(e.target.value) })}
                          placeholder="Orden"
                          className={darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                        />
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {item.nombre}
                        </h4>
                        {!item.activo && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                            Inactivo
                          </Badge>
                        )}
                        {item.metadata?.codigo && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            {item.metadata.codigo}
                          </Badge>
                        )}
                      </div>
                      {item.descripcion && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {item.descripcion}
                        </p>
                      )}
                      {item.metadata?.presentacion && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          📦 {item.metadata.presentacion}
                        </p>
                      )}
                      {item.metadata?.especie && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          🐾 {item.metadata.especie}
                        </p>
                      )}
                      {item.metadata?.frecuencia && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          🔄 Cada {item.metadata.frecuencia}
                        </p>
                      )}
                      {item.metadata?.dias !== undefined && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          📅 {item.metadata.dias} días
                        </p>
                      )}
                      {item.metadata?.precio !== undefined && (
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          💰 S/ {item.metadata.precio.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {editando?.categoria === categoria && editando?.id === item.id ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditando(null)}
                      className={darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600'}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditando({ categoria, id: item.id })}
                      className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600'}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActivo(categoria, item.id)}
                    className={item.activo 
                      ? darkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600'
                      : darkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-400'
                    }
                  >
                    {item.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => eliminarItem(categoria, item.id)}
                    className={darkMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {config.items.length === 0 && (
            <div className="text-center py-12">
              <Settings className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                No hay elementos configurados
              </p>
            </div>
          )}
        </div>

        {/* Modal Agregar */}
        {agregando === categoria && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className={`w-full max-w-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Agregar {config.titulo}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAgregando(null);
                      setNuevoItem({ nombre: '', descripcion: '', activo: true, metadata: {} });
                    }}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      value={nuevoItem.nombre}
                      onChange={(e) => setNuevoItem({ ...nuevoItem, nombre: e.target.value })}
                      className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                    />
                  </div>

                  {config.campos?.includes('descripcion') && (
                    <div>
                      <Label>Descripción</Label>
                      <Textarea
                        value={nuevoItem.descripcion}
                        onChange={(e) => setNuevoItem({ ...nuevoItem, descripcion: e.target.value })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                        rows={3}
                      />
                    </div>
                  )}

                  {config.campos?.includes('codigo') && (
                    <div>
                      <Label>Código</Label>
                      <Input
                        value={nuevoItem.metadata?.codigo || ''}
                        onChange={(e) => setNuevoItem({
                          ...nuevoItem,
                          metadata: { ...nuevoItem.metadata, codigo: e.target.value }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  {config.campos?.includes('presentacion') && (
                    <div>
                      <Label>Presentación</Label>
                      <Input
                        value={nuevoItem.metadata?.presentacion || ''}
                        onChange={(e) => setNuevoItem({
                          ...nuevoItem,
                          metadata: { ...nuevoItem.metadata, presentacion: e.target.value }
                        })}
                        placeholder="Ej: Comprimidos 500mg"
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  {config.campos?.includes('especie') && (
                    <div>
                      <Label>Especie</Label>
                      <Input
                        value={nuevoItem.metadata?.especie || ''}
                        onChange={(e) => setNuevoItem({
                          ...nuevoItem,
                          metadata: { ...nuevoItem.metadata, especie: e.target.value }
                        })}
                        placeholder="Ej: Canino, Felino, Ambos"
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  {config.campos?.includes('frecuencia') && (
                    <div>
                      <Label>Frecuencia</Label>
                      <Input
                        value={nuevoItem.metadata?.frecuencia || ''}
                        onChange={(e) => setNuevoItem({
                          ...nuevoItem,
                          metadata: { ...nuevoItem.metadata, frecuencia: e.target.value }
                        })}
                        placeholder="Ej: 1 año, 6 meses"
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  {config.campos?.includes('dias') && (
                    <div>
                      <Label>Días</Label>
                      <Input
                        type="number"
                        value={nuevoItem.metadata?.dias || ''}
                        onChange={(e) => setNuevoItem({
                          ...nuevoItem,
                          metadata: { ...nuevoItem.metadata, dias: parseInt(e.target.value) || 0 }
                        })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  {config.campos?.includes('precio') && (
                    <div>
                      <Label>Precio Base</Label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-2.5 text-gray-500">S/</span>
                        <Input
                          type="number"
                          value={nuevoItem.metadata?.precio || ''}
                          onChange={(e) => setNuevoItem({
                            ...nuevoItem,
                            metadata: { ...nuevoItem.metadata, precio: parseInt(e.target.value) || 0 }
                          })}
                          className={`pl-8 ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : ''}`}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  )}

                  {config.campos?.includes('orden') && (
                    <div>
                      <Label>Orden</Label>
                      <Input
                        type="number"
                        value={nuevoItem.orden || ''}
                        onChange={(e) => setNuevoItem({ ...nuevoItem, orden: parseInt(e.target.value) || 0 })}
                        className={darkMode ? 'bg-gray-900 border-gray-700 text-white mt-1' : 'mt-1'}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={nuevoItem.activo ?? true}
                      onCheckedChange={(checked) => setNuevoItem({ ...nuevoItem, activo: checked })}
                    />
                    <Label>Activo</Label>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAgregando(null);
                      setNuevoItem({ nombre: '', descripcion: '', activo: true, metadata: {} });
                    }}
                    className={darkMode ? 'border-gray-700 text-gray-300' : ''}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => agregarItem(categoria)}
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
      </Card>
    );
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className={`text-3xl ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center gap-3`}>
            <div className="brand-mark text-white p-3 rounded-xl">
              <Settings className="w-8 h-8" />
            </div>
            Configuración
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Apariencia, agenda y catálogos del portal especialista
          </p>
        </div>

        <Card className={`p-5 sm:p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <ThemePicker variant="full" />
        </Card>

        {/* Tabs */}
        <Tabs value={tabActual} onValueChange={setTabActual} className="w-full">
          <TabsList className={`w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="servicios">Servicios</TabsTrigger>
            <TabsTrigger value="finanzas">Finanzas</TabsTrigger>
            <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
            <TabsTrigger value="clinica">Clínica</TabsTrigger>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sistema" className="data-[state=active]:bg-red-500 data-[state=active]:text-white font-semibold">Sistema</TabsTrigger>
          </TabsList>

          {/* TAB AGENDA */}
          <TabsContent value="agenda" className="mt-6">
            <ConfiguracionAgenda />
          </TabsContent>

          {/* TAB SERVICIOS */}
          <TabsContent value="servicios" className="mt-6 space-y-6">
            <TablaConfiguracion categoria="tiposServicios" />
            <TablaConfiguracion categoria="especialidades" />
          </TabsContent>

          {/* TAB FINANZAS */}
          <TabsContent value="finanzas" className="mt-6 space-y-6">
            <TablaConfiguracion categoria="categoriasGastos" />
            <TablaConfiguracion categoria="metodosPago" />
          </TabsContent>

          {/* TAB PACIENTES */}
          <TabsContent value="pacientes" className="mt-6 space-y-6">
            <TablaConfiguracion categoria="especies" />
            <TablaConfiguracion categoria="razasCaninas" />
            <TablaConfiguracion categoria="razasFelinas" />
            <TablaConfiguracion categoria="diagnosticos" />
            <TablaConfiguracion categoria="medicamentos" />
            <TablaConfiguracion categoria="vacunas" />
          </TabsContent>

          {/* TAB CLÍNICA */}
          <TabsContent value="clinica" className="mt-6 space-y-6">
            <TablaConfiguracion categoria="tiposHistoriaClinica" />
          </TabsContent>

          {/* TAB FACTURACIÓN */}
          <TabsContent value="facturacion" className="mt-6 space-y-6">
            <TablaConfiguracion categoria="terminosPago" />
          </TabsContent>

          {/* TAB GENERAL */}
          <TabsContent value="general" className="mt-6">
            <Card className={`p-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} text-center`}>
              <Settings className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Configuraciones Generales
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Configuraciones adicionales del sistema próximamente
              </p>
            </Card>
          </TabsContent>

          {/* TAB SISTEMA */}
          <TabsContent value="sistema" className="mt-6 space-y-6">
            <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Asignar datos antiguos a mi cuenta</h3>
              <p className={`mt-1 mb-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Los registros creados antes de separar los datos por especialista no tienen dueño y los ven todas las cuentas.
                Úsalo una sola vez, antes de invitar a otros especialistas. Solo disponible para administradores.
              </p>
              <Button
                onClick={handleAsignarDatosAntiguos}
                disabled={asignandoDatos}
                className="w-full sm:w-auto"
              >
                {asignandoDatos ? 'Asignando...' : 'Asignar datos antiguos'}
              </Button>
            </Card>

            <Card className={`p-6 border-red-200 ${darkMode ? 'bg-red-900/10 border-red-900' : 'bg-red-50'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Zona de Peligro</h3>
                  <p className={`mt-1 mb-4 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                    Estas acciones son destructivas y no se pueden deshacer.
                  </p>
                  
                  <div className={`p-4 rounded-lg border shadow-sm ${darkMode ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-100'}`}>
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Restablecer Base de Datos</h4>
                    <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Elimina todos los registros de pacientes, citas, facturas y usuarios. La configuración base se mantendrá, pero los datos operativos serán borrados permanentemente.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleResetData}
                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Todo y Resetear
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
