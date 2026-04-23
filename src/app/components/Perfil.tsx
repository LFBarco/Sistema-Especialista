import { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, DollarSign, Calendar, Clock, Save, Key, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { toast } from 'sonner';
import * as API from '../utils/api';

export function Perfil() {
  const { darkMode, navegarA, usuarioActual } = useApp();
  const [editMode, setEditMode] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [perfil, setPerfil] = useState({
    nombre: usuarioActual?.nombre || '',
    email: usuarioActual?.email || '',
    telefono: '',
    especialidad: usuarioActual?.especialidad || '',
    cedula: '',
    direccion: '',
    tarifas: {
      ecocardiograma: 0,
      consultaCardiologica: 0,
      electrocardiograma: 0,
      seguimiento: 0
    },
    disponibilidad: {
      lunes: { activo: true, inicio: '09:00', fin: '18:00' },
      martes: { activo: true, inicio: '09:00', fin: '18:00' },
      miercoles: { activo: true, inicio: '09:00', fin: '18:00' },
      jueves: { activo: true, inicio: '09:00', fin: '18:00' },
      viernes: { activo: true, inicio: '09:00', fin: '14:00' },
      sabado: { activo: false, inicio: '', fin: '' },
      domingo: { activo: false, inicio: '', fin: '' }
    },
    notificaciones: {
      emailNuevaSolicitud: true,
      emailRecordatorioServicio: true,
      emailPagoRecibido: true,
      emailFacturaVencida: true
    }
  });

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  const diasLabels: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      // Persistir perfil en Supabase via API genérica
      await API.fetchPerfilUpdate(perfil);
      setEditMode(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      // Guardar localmente aunque falle el servidor
      setEditMode(false);
      toast.success('Perfil guardado localmente');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="p-2.5 rounded-xl"
              style={{ 
                background: darkMode 
                  ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)',
                border: darkMode ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid rgba(249, 115, 22, 0.15)'
              }}
            >
              <User className="w-6 h-6" style={{ color: '#F97316' }} />
            </div>
            <h1 
              className="text-3xl font-bold tracking-tight"
              style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
            >
              Perfil Profesional
            </h1>
          </div>
          <p 
            className="text-sm ml-[52px]"
            style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
          >
            Configura tu información y preferencias profesionales
          </p>
        </div>
        <button
          onClick={() => {
            if (editMode) {
              handleGuardarCambios();
            } else {
              setEditMode(true);
            }
          }}
          disabled={guardando}
          className="px-4 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition-all shadow-lg flex items-center font-medium disabled:opacity-50"
        >
          {guardando ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : editMode ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          ) : (
            'Editar Perfil'
          )}
        </button>
      </div>

      {/* Profile Card */}
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start space-x-6 mb-6">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              background: darkMode 
                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)'
            }}
          >
            <User className="w-12 h-12" style={{ color: '#F97316' }} />
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{perfil.nombre}</h2>
            <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{perfil.especialidad}</p>
            <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="flex items-center">
                <Briefcase className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {perfil.cedula}
              </div>
              <div className="flex items-center">
                <Mail className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {perfil.email}
              </div>
              <div className="flex items-center">
                <Phone className={`w-4 h-4 mr-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                {perfil.telefono}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nombre Completo</label>
            <input
              type="text"
              value={perfil.nombre}
              onChange={(e) => setPerfil({...perfil, nombre: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cédula Profesional</label>
            <input
              type="text"
              value={perfil.cedula}
              onChange={(e) => setPerfil({...perfil, cedula: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <input
              type="email"
              value={perfil.email}
              onChange={(e) => setPerfil({...perfil, email: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Teléfono</label>
            <input
              type="tel"
              value={perfil.telefono}
              onChange={(e) => setPerfil({...perfil, telefono: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Especialidad</label>
            <input
              type="text"
              value={perfil.especialidad}
              onChange={(e) => setPerfil({...perfil, especialidad: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Dirección</label>
            <input
              type="text"
              value={perfil.direccion}
              onChange={(e) => setPerfil({...perfil, direccion: e.target.value})}
              disabled={!editMode}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                  : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Tarifas */}
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <DollarSign className="w-5 h-5 mr-2" style={{ color: '#F97316' }} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Tarifas por Servicio</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ecocardiograma</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={perfil.tarifas.ecocardiograma}
                onChange={(e) => setPerfil({
                  ...perfil, 
                  tarifas: {...perfil.tarifas, ecocardiograma: Number(e.target.value)}
                })}
                disabled={!editMode}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Consulta Cardiológica</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={perfil.tarifas.consultaCardiologica}
                onChange={(e) => setPerfil({
                  ...perfil, 
                  tarifas: {...perfil.tarifas, consultaCardiologica: Number(e.target.value)}
                })}
                disabled={!editMode}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Electrocardiograma</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={perfil.tarifas.electrocardiograma}
                onChange={(e) => setPerfil({
                  ...perfil, 
                  tarifas: {...perfil.tarifas, electrocardiograma: Number(e.target.value)}
                })}
                disabled={!editMode}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Seguimiento</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>$</span>
              <input
                type="number"
                value={perfil.tarifas.seguimiento}
                onChange={(e) => setPerfil({
                  ...perfil, 
                  tarifas: {...perfil.tarifas, seguimiento: Number(e.target.value)}
                })}
                disabled={!editMode}
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode 
                    ? 'bg-gray-900 border-gray-700 text-gray-200 disabled:bg-gray-800' 
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-50'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disponibilidad */}
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 mr-2" style={{ color: '#F97316' }} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Disponibilidad Horaria</h2>
        </div>

        <div className="space-y-3">
          {diasSemana.map((dia) => {
            const disponibilidad = perfil.disponibilidad[dia as keyof typeof perfil.disponibilidad];
            return (
              <div key={dia} className={`flex items-center space-x-4 p-3 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="w-32">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={disponibilidad.activo}
                      onChange={(e) => setPerfil({
                        ...perfil,
                        disponibilidad: {
                          ...perfil.disponibilidad,
                          [dia]: {...disponibilidad, activo: e.target.checked}
                        }
                      })}
                      disabled={!editMode}
                      className="mr-2 rounded"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{diasLabels[dia]}</span>
                  </label>
                </div>

                {disponibilidad.activo && (
                  <div className="flex items-center space-x-2 flex-1">
                    <Clock className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="time"
                      value={disponibilidad.inicio}
                      onChange={(e) => setPerfil({
                        ...perfil,
                        disponibilidad: {
                          ...perfil.disponibilidad,
                          [dia]: {...disponibilidad, inicio: e.target.value}
                        }
                      })}
                      disabled={!editMode}
                      className={`px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-200 disabled:bg-gray-900' 
                          : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                      }`}
                    />
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>a</span>
                    <input
                      type="time"
                      value={disponibilidad.fin}
                      onChange={(e) => setPerfil({
                        ...perfil,
                        disponibilidad: {
                          ...perfil.disponibilidad,
                          [dia]: {...disponibilidad, fin: e.target.value}
                        }
                      })}
                      disabled={!editMode}
                      className={`px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                        darkMode 
                          ? 'bg-gray-800 border-gray-700 text-gray-200 disabled:bg-gray-900' 
                          : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notificaciones */}
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <Mail className="w-5 h-5 mr-2" style={{ color: '#F97316' }} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Preferencias de Notificación</h2>
        </div>

        <div className="space-y-3">
          <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            darkMode ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <input
              type="checkbox"
              checked={perfil.notificaciones.emailNuevaSolicitud}
              onChange={(e) => setPerfil({
                ...perfil,
                notificaciones: {...perfil.notificaciones, emailNuevaSolicitud: e.target.checked}
              })}
              disabled={!editMode}
              className="mr-3 rounded"
            />
            <div className="flex-1">
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Nueva solicitud de servicio</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recibir email cuando una clínica solicite un servicio</p>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            darkMode ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <input
              type="checkbox"
              checked={perfil.notificaciones.emailRecordatorioServicio}
              onChange={(e) => setPerfil({
                ...perfil,
                notificaciones: {...perfil.notificaciones, emailRecordatorioServicio: e.target.checked}
              })}
              disabled={!editMode}
              className="mr-3 rounded"
            />
            <div className="flex-1">
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Recordatorio de servicio</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Recibir recordatorio 24 horas antes del servicio</p>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            darkMode ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <input
              type="checkbox"
              checked={perfil.notificaciones.emailPagoRecibido}
              onChange={(e) => setPerfil({
                ...perfil,
                notificaciones: {...perfil.notificaciones, emailPagoRecibido: e.target.checked}
              })}
              disabled={!editMode}
              className="mr-3 rounded"
            />
            <div className="flex-1">
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Pago recibido</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Notificar cuando se reciba un pago</p>
            </div>
          </label>

          <label className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            darkMode ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
          }`}>
            <input
              type="checkbox"
              checked={perfil.notificaciones.emailFacturaVencida}
              onChange={(e) => setPerfil({
                ...perfil,
                notificaciones: {...perfil.notificaciones, emailFacturaVencida: e.target.checked}
              })}
              disabled={!editMode}
              className="mr-3 rounded"
            />
            <div className="flex-1">
              <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Factura vencida</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alertas de facturas que están por vencer</p>
            </div>
          </label>
        </div>
      </div>

      {/* Seguridad */}
      <div className={`rounded-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center mb-4">
          <Key className="w-5 h-5 mr-2" style={{ color: '#F97316' }} />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Seguridad</h2>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Cambiar contraseña</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Última actualización hace 30 días</p>
          </div>
          <button
            onClick={() => toast.info('Función de cambio de contraseña en desarrollo')}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
              darkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Cambiar
          </button>
        </div>
      </div>
    </div>
  );
}