import { ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  data: any[];
  minHeight?: string | number;
  darkMode?: boolean;
}

export function ChartWrapper({ children, data, minHeight = 320, darkMode = false }: ChartWrapperProps) {
  // Si no hay datos, mostrar mensaje vacío
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg`}
        style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}
      >
        <div className="text-center">
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  // Renderizar el gráfico normalmente
  return <>{children}</>;
}
