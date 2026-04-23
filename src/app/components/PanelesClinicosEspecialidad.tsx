import { Heart, Activity, Droplet, Wind, Thermometer, Pill, Brain, Utensils, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PanelProps {
  darkMode: boolean;
  data?: any;
}

// ❤️ PANEL CARDIOLOGÍA
export function PanelCardiologia({ darkMode, data }: PanelProps) {
  const datos = data || {
    frecuenciaCardiaca: 145,
    soplo: {
      presente: true,
      grado: 'III/VI',
      localizacion: 'Mitral'
    },
    presionArterial: {
      sistolica: 140,
      diastolica: 90
    },
    diagnostico: 'Insuficiencia mitral degenerativa con soplo grado III/VI. Sospecha de cardiomiopatía hipertrófica.',
    riesgoQuirurgico: 'Moderado'
  };

  const getRiesgoBadge = (riesgo: string) => {
    const config = {
      'Bajo': 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400',
      'Moderado': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Alto': 'bg-orange-500/20 text-orange-600 border-orange-500/50 dark:bg-orange-900/30 dark:text-orange-400',
      'Crítico': 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400'
    };
    return config[riesgo as keyof typeof config] || config.Moderado;
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Cardiológico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación cardiovascular especializada
            </p>
          </div>
        </div>
        <Badge className={getRiesgoBadge(datos.riesgoQuirurgico)}>
          Riesgo Quirúrgico: {datos.riesgoQuirurgico}
        </Badge>
      </div>

      {/* Signos Vitales Cardíacos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-red-500" />
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Frecuencia Cardíaca
            </p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.frecuenciaCardiaca}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              lpm
            </span>
          </p>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-4 h-4 text-blue-500" />
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Presión Arterial
            </p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.presionArterial?.sistolica}/{datos.presionArterial?.diastolica}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              mmHg
            </span>
          </p>
        </div>

        <div className={`p-4 rounded-lg ${datos.soplo?.presente ? (darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200') : (darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200')}`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart className={`w-4 h-4 ${datos.soplo?.presente ? 'text-red-500' : 'text-gray-400'}`} />
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Soplo Cardíaco
            </p>
          </div>
          {datos.soplo?.presente ? (
            <>
              <p className={`text-2xl font-bold ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                Grado {datos.soplo.grado}
              </p>
              <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                Localización: {datos.soplo.localizacion}
              </p>
            </>
          ) : (
            <p className={`text-lg font-medium ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              No detectado
            </p>
          )}
        </div>
      </div>

      {/* ECG Mock Visualization */}
      <div className={`p-4 rounded-lg mb-4 ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
          Trazado ECG (Simulación)
        </p>
        <div className="h-24 flex items-center justify-center" style={{
          backgroundImage: `repeating-linear-gradient(0deg, ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'} 0px, transparent 1px, transparent 5px, ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'} 6px), repeating-linear-gradient(90deg, ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'} 0px, transparent 1px, transparent 5px, ${darkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'} 6px)`
        }}>
          <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path
              d="M0,50 L50,50 L55,20 L60,80 L65,50 L100,50 L150,50 L155,20 L160,80 L165,50 L200,50 L250,50 L255,20 L260,80 L265,50 L300,50 L350,50 L355,20 L360,80 L365,50 L400,50"
              fill="none"
              stroke={darkMode ? '#EF4444' : '#DC2626'}
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* Diagnóstico Cardiológico */}
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Diagnóstico Cardiológico
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.diagnostico}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 🔪 PANEL CIRUGÍA
export function PanelCirugia({ darkMode, data }: PanelProps) {
  const datos = data || {
    diagnosticoQuirurgico: 'Masa abdominal compatible con neoplasia esplénica',
    tipoCirugia: 'Esplenectomía',
    riesgoASA: 'ASA III',
    recomendacionesPreop: [
      'Hemograma completo y perfil bioquímico',
      'Radiografía torácica preoperatoria',
      'Ayuno de 12 horas previo'
    ],
    indicacionesPostop: [
      'Analgesia multimodal por 72h',
      'Antibióticoterapia profiláctica',
      'Reposo absoluto por 14 días',
      'Control de herida cada 48h'
    ],
    estado: 'Programada',
    fechaProgramada: '2026-02-05'
  };

  const getEstadoBadge = (estado: string) => {
    const config = {
      'Programada': 'bg-blue-500/20 text-blue-600 border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-400',
      'Realizada': 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400',
      'Cancelada': 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400'
    };
    return config[estado as keyof typeof config] || config.Programada;
  };

  const getASAColor = (asa: string) => {
    const colors = {
      'ASA I': 'text-green-500',
      'ASA II': 'text-yellow-500',
      'ASA III': 'text-orange-500',
      'ASA IV': 'text-red-500',
      'ASA V': 'text-red-700'
    };
    return colors[asa as keyof typeof colors] || colors['ASA III'];
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Quirúrgico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Planificación y seguimiento quirúrgico
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getEstadoBadge(datos.estado)}>
            {datos.estado}
          </Badge>
          <Badge className={`${getASAColor(datos.riesgoASA)} bg-gray-500/20 border-gray-500/50`}>
            {datos.riesgoASA}
          </Badge>
        </div>
      </div>

      {/* Información Quirúrgica */}
      <div className="space-y-4">
        {/* Diagnóstico y Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
              Diagnóstico Quirúrgico
            </p>
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {datos.diagnosticoQuirurgico}
            </p>
          </div>
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
              Tipo de Cirugía
            </p>
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {datos.tipoCirugia}
            </p>
          </div>
        </div>

        {datos.fechaProgramada && (
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
              📅 Fecha programada: {new Date(datos.fechaProgramada).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        {/* Recomendaciones Preoperatorias */}
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Recomendaciones Preoperatorias
          </p>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
            <ul className="space-y-2">
              {datos.recomendacionesPreop.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {rec}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Indicaciones Postoperatorias */}
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Indicaciones Postoperatorias
          </p>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
            <ul className="space-y-2">
              {datos.indicacionesPostop.map((ind: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                    {ind}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}

// 😴 PANEL ANESTESIA
export function PanelAnestesia({ darkMode, data }: PanelProps) {
  const datos = data || {
    evaluacionASA: 'ASA II',
    pesoAnestesico: 28.5,
    protocoloAnestesico: 'Premedicación: Acepromazina 0.02mg/kg + Metadona 0.2mg/kg IM. Inducción: Propofol 4mg/kg IV. Mantenimiento: Isoflurano 1.5-2.5%',
    riesgosDetectados: [
      'Paciente geriátrico',
      'Soplo cardíaco grado III/VI'
    ],
    aprobacionAnestesica: true,
    observacionesCriticas: 'Monitorización cardíaca continua. Considerar analgesia multimodal postoperatoria.'
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Thermometer className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Anestésico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación y protocolo anestésico
            </p>
          </div>
        </div>
        <Badge className={datos.aprobacionAnestesica ? 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400'}>
          {datos.aprobacionAnestesica ? '✓ Aprobado' : '✗ No Aprobado'}
        </Badge>
      </div>

      {/* Evaluación y Peso */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Clasificación ASA
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.evaluacionASA}
          </p>
        </div>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Peso Anestésico
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.pesoAnestesico}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </span>
          </p>
        </div>
      </div>

      {/* Protocolo Anestésico */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Protocolo Anestésico
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.protocoloAnestesico}
          </p>
        </div>
      </div>

      {/* Riesgos Detectados */}
      {datos.riesgosDetectados.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            ⚠️ Riesgos Detectados
          </p>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
            <ul className="space-y-1">
              {datos.riesgosDetectados.map((riesgo: string, idx: number) => (
                <li key={idx} className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                  • {riesgo}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Observaciones Críticas */}
      {datos.observacionesCriticas && (
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Observaciones Críticas
          </p>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`text-sm ${darkMode ? 'text-yellow-200' : 'text-yellow-900'}`}>
              {datos.observacionesCriticas}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Continuaré con los demás paneles en el siguiente mensaje por límite de tokens

// 🩻 PANEL ECOGRAFÍA/IMAGENOLOGÍA
export function PanelEcografia({ darkMode, data }: PanelProps) {
  const datos = data || {
    tipoEstudio: 'Ecografía Abdominal Completa',
    fecha: '2026-01-27',
    hallazgosPrincipales: [
      'Masa esplénica heterogénea de 8.5 x 7.2 cm',
      'Líquido libre en cavidad abdominal (aprox. 150ml)',
      'Hígado con textura heterogénea, sugestivo de metástasis',
      'Resto de órganos sin alteraciones significativas'
    ],
    conclusion: 'Hallazgos compatibles con neoplasia esplénica con alta sospecha de hemangiosarcoma. Presencia de líquido libre abdominal y lesiones hepáticas sugestivas de proceso metastásico.',
    recomendacionClinica: 'Esplenectomía de urgencia. Biopsia hepática intraoperatoria. Considerar quimioterapia adyuvante según resultado histopatológico.',
    imagenesMock: 3
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Imagenológico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Reporte de estudios por imagen
            </p>
          </div>
        </div>
      </div>

      {/* Tipo y Fecha */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Tipo de Estudio
          </p>
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.tipoEstudio}
          </p>
        </div>
        <div>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Fecha del Estudio
          </p>
          <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Date(datos.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Hallazgos Principales */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Hallazgos Principales
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <ul className="space-y-2">
            {datos.hallazgosPrincipales.map((hallazgo: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${darkMode ? 'bg-teal-400' : 'bg-teal-600'}`}></span>
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {hallazgo}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Imágenes Mock */}
      {datos.imagenesMock && (
        <div className="mb-4">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Imágenes Adjuntas ({datos.imagenesMock})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: datos.imagenesMock }).map((_, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <Activity className={`w-8 h-8 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conclusión */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Conclusión
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.conclusion}
          </p>
        </div>
      </div>

      {/* Recomendación Clínica */}
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Recomendación Clínica
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
            {datos.recomendacionClinica}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 🦷 PANEL ODONTOLOGÍA
export function PanelOdontologia({ darkMode, data }: PanelProps) {
  const datos = data || {
    indicePeriodontal: 3,
    piezasAfectadas: ['108', '208', '308', '408', '109', '309'],
    diagnostico: 'Enfermedad periodontal grado 3 generalizada. Múltiples piezas con movilidad grado 2-3. Cálculo dental severo.',
    procedimientoSugerido: 'Profilaxis dental completa con extracción de piezas móviles (108, 208, 308, 408)',
    necesitaAnestesia: true
  };

  const getIndiceBadge = (indice: number) => {
    const config = [
      { max: 0, label: 'Normal', class: 'bg-green-500/20 text-green-600 border-green-500/50 dark:bg-green-900/30 dark:text-green-400' },
      { max: 1, label: 'Gingivitis Leve', class: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-400' },
      { max: 2, label: 'Periodontitis Moderada', class: 'bg-orange-500/20 text-orange-600 border-orange-500/50 dark:bg-orange-900/30 dark:text-orange-400' },
      { max: 3, label: 'Periodontitis Severa', class: 'bg-red-500/20 text-red-600 border-red-500/50 dark:bg-red-900/30 dark:text-red-400' },
      { max: 4, label: 'Periodontitis Avanzada', class: 'bg-red-700/20 text-red-700 border-red-700/50 dark:bg-red-950/30 dark:text-red-500' },
    ];
    const item = config.find(c => indice <= c.max) || config[config.length - 1];
    return { label: item.label, class: item.class };
  };

  const indiceBadge = getIndiceBadge(datos.indicePeriodontal);

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Odontológico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación dental y periodontal
            </p>
          </div>
        </div>
        <Badge className={indiceBadge.class}>
          Grado {datos.indicePeriodontal}: {indiceBadge.label}
        </Badge>
      </div>

      {/* Piezas Afectadas */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Piezas Dentales Afectadas
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex flex-wrap gap-2">
            {datos.piezasAfectadas.map((pieza: string, idx: number) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-sm font-mono font-medium ${
                  darkMode ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                #{pieza}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Diagnóstico Odontológico
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.diagnostico}
          </p>
        </div>
      </div>

      {/* Procedimiento Sugerido */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Procedimiento Sugerido
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
            {datos.procedimientoSugerido}
          </p>
        </div>
      </div>

      {/* Anestesia Requerida */}
      {datos.necesitaAnestesia && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          darkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
          <p className={`text-sm font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
            Requiere anestesia general para el procedimiento
          </p>
        </div>
      )}
    </Card>
  );
}

// 🌬️ PANEL NEUMOLOGÍA
export function PanelNeumologia({ darkMode, data }: PanelProps) {
  const datos = data || {
    frecuenciaRespiratoria: 45,
    saturacionO2: 89,
    sonidosPulmonares: ['Crepitaciones bilaterales', 'Disminución de ruidos en lóbulo craneal derecho'],
    diagnosticoRespiratorio: 'Neumonía bacteriana aguda bilateral con componente de bronconeumonía. Hipoxemia moderada.',
    tratamientoSugerido: 'Antibióticoterapia de amplio espectro (Amoxicilina-clavulánico 20mg/kg BID). Oxigenoterapia suplementaria. Nebulizaciones con suero fisiológico 3-4 veces/día. Reevaluación en 48-72h.'
  };

  const getSaturacionColor = (sat: number) => {
    if (sat >= 95) return { color: 'text-green-500', bg: 'bg-green-500/20' };
    if (sat >= 90) return { color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    if (sat >= 85) return { color: 'text-orange-500', bg: 'bg-orange-500/20' };
    return { color: 'text-red-500', bg: 'bg-red-500/20' };
  };

  const satColors = getSaturacionColor(datos.saturacionO2);

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Respiratorio
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación del sistema respiratorio
            </p>
          </div>
        </div>
      </div>

      {/* Parámetros Respiratorios */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Wind className="w-4 h-4 text-sky-500" />
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Frecuencia Respiratoria
            </p>
          </div>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.frecuenciaRespiratoria}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              rpm
            </span>
          </p>
        </div>

        <div className={`p-4 rounded-lg ${satColors.bg} ${darkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Droplet className={`w-4 h-4 ${satColors.color}`} />
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Saturación O₂
            </p>
          </div>
          <p className={`text-2xl font-bold ${satColors.color}`}>
            {datos.saturacionO2}
            <span className="text-sm font-normal ml-1">%</span>
          </p>
        </div>
      </div>

      {/* Sonidos Pulmonares */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Sonidos Pulmonares Detectados
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <ul className="space-y-1">
            {datos.sonidosPulmonares.map((sonido: string, idx: number) => (
              <li key={idx} className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                • {sonido}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Diagnóstico Respiratorio
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.diagnosticoRespiratorio}
          </p>
        </div>
      </div>

      {/* Tratamiento Sugerido */}
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Tratamiento Sugerido
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
            {datos.tratamientoSugerido}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 🧴 PANEL DERMATOLOGÍA
export function PanelDermatologia({ darkMode, data }: PanelProps) {
  const datos = data || {
    lesiones: [
      {
        tipo: 'Pápulas eritematosas',
        localizacion: ['Región dorsal', 'Flancos', 'Base de cola']
      },
      {
        tipo: 'Alopecia multifocal',
        localizacion: ['Miembros posteriores', 'Abdomen ventral']
      },
      {
        tipo: 'Costras y escamas',
        localizacion: ['Pabellones auriculares', 'Región facial']
      }
    ],
    diagnosticoPresuntivo: 'Dermatitis alérgica por pulgas (DAPP) con infección bacteriana secundaria. Considerar hipersensibilidad alimentaria como diagnóstico diferencial.',
    tratamientoTopico: 'Champú medicado con clorhexidina 2 veces/semana. Crema con hidrocortisona en zonas afectadas.',
    tratamientoSistemico: 'Antiparasitario de amplio espectro (Fluralaner). Antibiótico (Cefalexina 22mg/kg BID x 14 días). Antipruriginoso (Oclacitinib 0.4mg/kg BID).',
    seguimiento: 'Control dermatológico en 14 días para reevaluación. Si no hay mejoría, considerar dieta de eliminación y biopsia cutánea.',
    fotosMock: 4
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Dermatológico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación cutánea especializada
            </p>
          </div>
        </div>
      </div>

      {/* Lesiones Dermatológicas */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
          Lesiones Dermatológicas Identificadas
        </p>
        <div className="space-y-3">
          {datos.lesiones.map((lesion: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
            >
              <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {lesion.tipo}
              </p>
              <div className="flex flex-wrap gap-1">
                {lesion.localizacion.map((loc: string, locIdx: number) => (
                  <span
                    key={locIdx}
                    className={`text-xs px-2 py-1 rounded ${
                      darkMode ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fotos Clínicas Mock */}
      {datos.fotosMock && (
        <div className="mb-4">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Fotografías Clínicas ({datos.fotosMock})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: datos.fotosMock }).map((_, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100 border border-gray-200'
                }`}
              >
                <Pill className={`w-6 h-6 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnóstico Presuntivo */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Diagnóstico Presuntivo
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.diagnosticoPresuntivo}
          </p>
        </div>
      </div>

      {/* Tratamientos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {datos.tratamientoTopico && (
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
              Tratamiento Tópico
            </p>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                {datos.tratamientoTopico}
              </p>
            </div>
          </div>
        )}
        {datos.tratamientoSistemico && (
          <div>
            <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
              Tratamiento Sistémico
            </p>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                {datos.tratamientoSistemico}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Seguimiento */}
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Seguimiento
        </p>
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
            {datos.seguimiento}
          </p>
        </div>
      </div>
    </Card>
  );
}

// 🍽️ PANEL NUTRICIÓN
export function PanelNutricion({ darkMode, data }: PanelProps) {
  const datos = data || {
    pesoActual: 38.5,
    pesoIdeal: 32.0,
    condicionCorporal: 7,
    dietaRecomendada: 'Alimento terapéutico reducido en calorías (Hill\'s Metabolic o Royal Canin Weight Control). Ración diaria: 280g divididos en 2 tomas.',
    suplementos: ['Omega 3 (500mg/día)', 'L-Carnitina (500mg/día)', 'Condroprotector (Glucosamina + Condroitina)'],
    seguimientoMensual: true
  };

  const getBCSColor = (bcs: number) => {
    if (bcs <= 3) return { label: 'Bajo peso', color: 'text-yellow-600', bg: 'bg-yellow-500/20' };
    if (bcs <= 5) return { label: 'Ideal', color: 'text-green-600', bg: 'bg-green-500/20' };
    if (bcs <= 7) return { label: 'Sobrepeso', color: 'text-orange-600', bg: 'bg-orange-500/20' };
    return { label: 'Obesidad', color: 'text-red-600', bg: 'bg-red-500/20' };
  };

  const bcsInfo = getBCSColor(datos.condicionCorporal);
  const diferenciaPeso = datos.pesoActual - datos.pesoIdeal;

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Nutricional
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación y plan nutricional
            </p>
          </div>
        </div>
        <Badge className={`${bcsInfo.bg} ${bcsInfo.color} border-gray-500/50`}>
          BCS {datos.condicionCorporal}/9: {bcsInfo.label}
        </Badge>
      </div>

      {/* Parámetros de Peso */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Peso Actual
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.pesoActual}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </span>
          </p>
        </div>

        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Peso Ideal
          </p>
          <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {datos.pesoIdeal}
            <span className={`text-sm font-normal ml-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              kg
            </span>
          </p>
        </div>

        <div className={`p-4 rounded-lg ${bcsInfo.bg} ${darkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Diferencia
          </p>
          <p className={`text-2xl font-bold ${bcsInfo.color}`}>
            {diferenciaPeso > 0 ? '+' : ''}{diferenciaPeso.toFixed(1)}
            <span className="text-sm font-normal ml-1">kg</span>
          </p>
        </div>
      </div>

      {/* Dieta Recomendada */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Dieta Recomendada
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.dietaRecomendada}
          </p>
        </div>
      </div>

      {/* Suplementos */}
      {datos.suplementos && datos.suplementos.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
            Suplementos Recomendados
          </p>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
            <ul className="space-y-1">
              {datos.suplementos.map((suplemento: string, idx: number) => (
                <li key={idx} className={`text-sm flex items-center gap-2 ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {suplemento}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Seguimiento */}
      {datos.seguimientoMensual && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
          <p className={`text-sm font-medium ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
            Requiere seguimiento nutricional mensual con control de peso
          </p>
        </div>
      )}
    </Card>
  );
}

// 🧠 PANEL ETOLOGÍA
export function PanelEtologia({ darkMode, data }: PanelProps) {
  const datos = data || {
    motivoConductual: 'Agresividad hacia otros perros durante paseos y en parques. Ladridos excesivos al quedarse solo en casa (ansiedad por separación).',
    evaluacionEtologica: 'Paciente presenta signos de ansiedad generalizada con componentes de miedo social hacia congéneres. Historia de socialización deficiente en etapa juvenil. Refuerzo involuntario de conductas de alerta por parte de propietarios.',
    diagnostico: 'Ansiedad por separación moderada + Miedo social hacia congéneres + Hiperactividad',
    planConductual: [
      'Desensibilización sistemática a la soledad (protocolo gradual)',
      'Contracondicionamiento con refuerzo positivo',
      'Enriquecimiento ambiental y cognitivo',
      'Ejercicio físico estructurado (2 sesiones diarias de 45min)',
      'Considerar feromonas sintéticas (Adaptil)'
    ],
    recomendacionesPropietario: [
      'Evitar castigos y reforzar calma',
      'Ignorar conductas de demanda de atención',
      'Establecer rutinas predecibles',
      'Desensibilización gradual a estímulos disparadores',
      'Consultar con etólogo certificado para seguimiento personalizado'
    ]
  };

  return (
    <Card className={`p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Panel Etológico
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Evaluación conductual especializada
            </p>
          </div>
        </div>
      </div>

      {/* Motivo Conductual */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Motivo de Consulta Conductual
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {datos.motivoConductual}
          </p>
        </div>
      </div>

      {/* Evaluación Etológica */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Evaluación Etológica
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
          <p className={`text-sm leading-relaxed ${darkMode ? 'text-blue-200' : 'text-blue-900'}`}>
            {datos.evaluacionEtologica}
          </p>
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Diagnóstico Conductual
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
          <p className={`text-sm font-medium leading-relaxed ${darkMode ? 'text-purple-200' : 'text-purple-900'}`}>
            {datos.diagnostico}
          </p>
        </div>
      </div>

      {/* Plan Conductual */}
      <div className="mb-4">
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Plan de Modificación Conductual
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
          <ul className="space-y-2">
            {datos.planConductual.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  darkMode ? 'bg-green-800 text-green-300' : 'bg-green-200 text-green-700'
                }`}>
                  {idx + 1}
                </span>
                <span className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-900'}`}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recomendaciones al Propietario */}
      <div>
        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-2`}>
          Recomendaciones para el Propietario
        </p>
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-orange-900/20 border border-orange-800' : 'bg-orange-50 border border-orange-200'}`}>
          <ul className="space-y-2">
            {datos.recomendacionesPropietario.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className={`text-sm ${darkMode ? 'text-orange-200' : 'text-orange-900'}`}>
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}