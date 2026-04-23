import { useState } from 'react';
import { ArrowLeft, Upload, FileText, ShieldCheck, AlertCircle, CheckCircle2, X, Clock, Award, Send } from 'lucide-react';
import { useApp } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

type EstadoDocumento = 'pendiente' | 'cargado' | 'rechazado' | 'aprobado';

interface Documento {
  id: string;
  nombre: string;
  descripcion: string;
  obligatorio: boolean;
  estado: EstadoDocumento;
  archivo?: File;
  motivoRechazo?: string;
}

export function VerificacionProfesional() {
  const { darkMode, navegarA } = useApp();
  
  const [documentos, setDocumentos] = useState<Documento[]>([
    {
      id: 'documento-identidad',
      nombre: 'Documento de Identidad',
      descripcion: 'Cédula de ciudadanía o pasaporte vigente (ambos lados)',
      obligatorio: true,
      estado: 'pendiente'
    },
    {
      id: 'titulo-profesional',
      nombre: 'Título Profesional',
      descripcion: 'Diploma de Médico Veterinario o certificado de grado',
      obligatorio: true,
      estado: 'pendiente'
    },
    {
      id: 'tarjeta-profesional',
      nombre: 'Tarjeta Profesional',
      descripcion: 'Tarjeta profesional vigente expedida por COMVEZCOL',
      obligatorio: true,
      estado: 'pendiente'
    },
    {
      id: 'certificacion-especialidad',
      nombre: 'Certificación de Especialidad',
      descripcion: 'Diploma o certificado de tu especialización',
      obligatorio: true,
      estado: 'pendiente'
    },
    {
      id: 'certificado-antecedentes',
      nombre: 'Certificado de Antecedentes',
      descripcion: 'Certificado judicial y disciplinario (opcional)',
      obligatorio: false,
      estado: 'pendiente'
    }
  ]);

  const [aceptaLegal, setAceptaLegal] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const progreso = Math.round(
    (documentos.filter(d => d.obligatorio && d.estado === 'cargado').length /
      documentos.filter(d => d.obligatorio).length) *
      100
  );

  const handleFileUpload = (documentoId: string, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo no debe superar 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos JPG, PNG o PDF');
      return;
    }

    setDocumentos(prevDocs =>
      prevDocs.map(doc =>
        doc.id === documentoId
          ? { ...doc, estado: 'cargado' as EstadoDocumento, archivo: file }
          : doc
      )
    );

    toast.success('Archivo cargado correctamente');
  };

  const eliminarDocumento = (documentoId: string) => {
    setDocumentos(prevDocs =>
      prevDocs.map(doc =>
        doc.id === documentoId
          ? { ...doc, estado: 'pendiente' as EstadoDocumento, archivo: undefined }
          : doc
      )
    );
    toast.info('Documento eliminado');
  };

  const puedeEnviar = () => {
    const documentosObligatoriosCargados = documentos
      .filter(d => d.obligatorio)
      .every(d => d.estado === 'cargado');
    
    return documentosObligatoriosCargados && aceptaLegal;
  };

  const enviarARevision = () => {
    if (!puedeEnviar()) {
      toast.error('Completa todos los documentos obligatorios y acepta los términos');
      return;
    }

    setEnviando(true);
    
    // Simular envío
    setTimeout(() => {
      setEnviando(false);
      toast.success('¡Documentos enviados a revisión!');
      toast.info('Recibirás una notificación en 24-48 horas');
      
      setTimeout(() => {
        navegarA('dashboard'); // Redirige al dashboard con estado PENDING
      }, 2000);
    }, 2000);
  };

  const getIconoEstado = (estado: EstadoDocumento) => {
    switch (estado) {
      case 'cargado':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'aprobado':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rechazado':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getBadgeEstado = (estado: EstadoDocumento) => {
    switch (estado) {
      case 'cargado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            Cargado
          </Badge>
        );
      case 'aprobado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
            Aprobado
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            Rechazado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navegarA('perfil-profesional')}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Verificación Profesional
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Valida tu identidad y credenciales para activar tu perfil público
              </p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Progreso de verificación
              </span>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {progreso}%
              </span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-green-500 to-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Instrucciones */}
          <Card className={`border-l-4 border-l-blue-500 ${darkMode ? 'bg-blue-500/10 border-gray-700' : 'bg-blue-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Instrucciones Importantes
                  </h3>
                  <ul className={`text-sm space-y-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    <li>• Los documentos deben ser legibles y estar vigentes</li>
                    <li>• Formatos aceptados: JPG, PNG o PDF (máx. 10MB por archivo)</li>
                    <li>• El proceso de revisión toma entre 24-48 horas hábiles</li>
                    <li>• Mantén tus datos de contacto actualizados para notificaciones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist de documentos */}
          <div className="space-y-4">
            {documentos.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`transition-all ${
                  doc.estado === 'cargado'
                    ? darkMode
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-green-50 border-green-200'
                    : doc.estado === 'rechazado'
                    ? darkMode
                      ? 'bg-red-500/10 border-red-500/50'
                      : 'bg-red-50 border-red-200'
                    : darkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Ícono de estado */}
                      <div className="flex-shrink-0 mt-1">
                        {getIconoEstado(doc.estado)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {doc.nombre}
                              </h3>
                              {doc.obligatorio && (
                                <span className="text-xs text-red-500 font-semibold">*</span>
                              )}
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {doc.descripcion}
                            </p>
                          </div>
                          {getBadgeEstado(doc.estado)}
                        </div>

                        {/* Archivo cargado */}
                        {doc.archivo && (
                          <div className={`flex items-center justify-between p-3 rounded-lg mb-3 ${
                            darkMode ? 'bg-gray-900' : 'bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-2">
                              <FileText className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {doc.archivo.name}
                              </span>
                              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                ({(doc.archivo.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>
                            <button
                              onClick={() => eliminarDocumento(doc.id)}
                              className={`p-1 rounded ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}
                            >
                              <X className={`w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                            </button>
                          </div>
                        )}

                        {/* Mensaje de rechazo */}
                        {doc.estado === 'rechazado' && doc.motivoRechazo && (
                          <div className={`p-3 rounded-lg mb-3 ${
                            darkMode ? 'bg-red-500/20' : 'bg-red-50'
                          }`}>
                            <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                              <strong>Motivo de rechazo:</strong> {doc.motivoRechazo}
                            </p>
                          </div>
                        )}

                        {/* Botón de carga */}
                        {doc.estado !== 'aprobado' && (
                          <label htmlFor={`upload-${doc.id}`} className="cursor-pointer">
                            <Button
                              variant={doc.estado === 'cargado' ? 'outline' : 'default'}
                              className={
                                doc.estado === 'cargado'
                                  ? darkMode
                                    ? 'border-gray-700'
                                    : ''
                                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                              }
                              asChild
                            >
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                {doc.estado === 'cargado' ? 'Cambiar archivo' : 'Subir documento'}
                              </span>
                            </Button>
                            <input
                              id={`upload-${doc.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(doc.id, file);
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Aceptación legal */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardContent className="p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptaLegal}
                  onChange={(e) => setAceptaLegal(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-2 border-green-500 text-green-500"
                />
                <div>
                  <p className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Acepto los términos de verificación y privacidad
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Confirmo que los documentos cargados son auténticos y me corresponden. 
                    Entiendo que la información será tratada de forma confidencial según 
                    normativas de protección de datos (GDPR / Ley 1581 de 2012).
                  </p>
                </div>
              </label>
            </CardContent>
          </Card>

          {/* Aviso de confidencialidad */}
          <Card className={darkMode ? 'bg-blue-500/10 border-blue-500/50' : 'bg-blue-50 border-blue-200'}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className={`font-bold mb-1 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    Protección de Datos
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    Tus documentos están protegidos con cifrado de extremo a extremo. 
                    Solo el equipo de verificación autorizado tendrá acceso temporal para validación. 
                    Los archivos serán eliminados del servidor una vez completado el proceso.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navegarA('perfil-profesional')}
              className={`flex-1 ${darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : ''}`}
            >
              Guardar y continuar luego
            </Button>
            <Button
              onClick={enviarARevision}
              disabled={!puedeEnviar() || enviando}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? (
                <>
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar a Revisión
                </>
              )}
            </Button>
          </div>

          {/* Aviso de progreso */}
          {!puedeEnviar() && (
            <div className={`p-4 rounded-xl border-2 ${
              darkMode
                ? 'bg-yellow-500/10 border-yellow-500/50'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`text-sm font-semibold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Faltan {documentos.filter(d => d.obligatorio && d.estado !== 'cargado').length} documento(s) obligatorio(s)
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-yellow-300' : 'text-yellow-600'}`}>
                    {!aceptaLegal && 'También debes aceptar los términos de verificación'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline estimado */}
          <Card className={darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <CardHeader>
              <CardTitle className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ¿Qué sigue después de enviar?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-500">1</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Revisión de documentos
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Nuestro equipo verificará la autenticidad de tus credenciales (24-48h)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-500">2</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notificación de resultado
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Recibirás un correo con el resultado de la verificación
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-green-500">3</span>
                  </div>
                  <div>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Activación del perfil
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Tu perfil será visible para clínicas y podrás comenzar a recibir solicitudes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
