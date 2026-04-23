import { Check, Clock, FileText, Stethoscope, X } from 'lucide-react';
import { motion } from 'motion/react';

interface TimelineProgresoProps {
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  darkMode: boolean;
  servicioRealizado?: boolean;
  facturaEmitida?: boolean;
}

export function TimelineProgreso({ estado, darkMode, servicioRealizado = false, facturaEmitida = false }: TimelineProgresoProps) {
  const steps = [
    {
      id: 1,
      label: 'Solicitud enviada',
      icon: Clock,
      completed: true, // Siempre completado si existe la solicitud
    },
    {
      id: 2,
      label: 'Aceptada',
      icon: Check,
      completed: estado === 'aceptada',
      cancelled: estado === 'rechazada',
    },
    {
      id: 3,
      label: 'Servicio',
      icon: Stethoscope,
      completed: servicioRealizado,
      disabled: estado !== 'aceptada',
    },
    {
      id: 4,
      label: 'Factura',
      icon: FileText,
      completed: facturaEmitida,
      disabled: !servicioRealizado,
    },
  ];

  const getStepColor = (step: typeof steps[0]) => {
    if (step.cancelled) return '#EF4444'; // Rojo
    if (step.completed) return '#10B981'; // Verde
    if (step.disabled) return darkMode ? '#374151' : '#D1D5DB'; // Gris
    return '#F97316'; // Naranja (actual)
  };

  const getStepBg = (step: typeof steps[0]) => {
    if (step.cancelled) return darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
    if (step.completed) return darkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)';
    if (step.disabled) return darkMode ? 'rgba(55, 65, 81, 0.15)' : 'rgba(209, 213, 219, 0.1)';
    return darkMode ? 'rgba(249, 115, 22, 0.15)' : 'rgba(249, 115, 22, 0.1)';
  };

  const getLineColor = (fromStep: typeof steps[0], toStep: typeof steps[0]) => {
    if (fromStep.cancelled || toStep.cancelled) return '#EF4444';
    if (fromStep.completed && toStep.completed) return '#10B981';
    if (fromStep.completed && !toStep.completed && !toStep.disabled) return '#F97316';
    return darkMode ? '#374151' : '#D1D5DB';
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const color = getStepColor(step);
          const bg = getStepBg(step);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1 relative">
              {/* Step Circle */}
              <div className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-center rounded-full border-2 relative"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: bg,
                    borderColor: color,
                  }}
                >
                  {step.cancelled ? (
                    <X className="w-5 h-5" style={{ color }} />
                  ) : step.completed ? (
                    <Check className="w-5 h-5" style={{ color }} />
                  ) : (
                    <Icon className="w-5 h-5" style={{ color }} />
                  )}
                </motion.div>
                
                {/* Label */}
                <p
                  className="text-xs font-medium mt-2 text-center whitespace-nowrap"
                  style={{ color: step.disabled ? (darkMode ? '#6B7280' : '#9CA3AF') : (darkMode ? '#E5E7EB' : '#0F172A') }}
                >
                  {step.label}
                </p>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className="flex-1 h-0.5 mx-2 relative"
                  style={{
                    backgroundColor: getLineColor(step, steps[index + 1]),
                    top: '-28px',
                  }}
                >
                  {step.completed && steps[index + 1].completed && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full"
                      style={{ backgroundColor: getLineColor(step, steps[index + 1]) }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
