import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2 } from 'lucide-react';

interface ClinicaFilterProps {
  selectedClinica: string;
  onSelectClinica: (value: string) => void;
  clinicas: Array<{
    id: string;
    nombre: string;
    color: string;
  }>;
  showAllOption?: boolean;
}

const COLORES_MAP: { [key: string]: string } = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  cyan: 'bg-cyan-500',
};

export function ClinicaFilter({ selectedClinica, onSelectClinica, clinicas, showAllOption = true }: ClinicaFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-4 h-4 text-gray-400" />
      <Select value={selectedClinica} onValueChange={onSelectClinica}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Filtrar por clínica" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="todas">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <span className="font-medium">Todas las Clínicas</span>
              </div>
            </SelectItem>
          )}
          {clinicas.map(clinica => (
            <SelectItem key={clinica.id} value={clinica.id}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${COLORES_MAP[clinica.color] || 'bg-gray-500'}`} />
                <span>{clinica.nombre}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Helper functions para obtener colores
export const getClinicaColor = (color: string): string => {
  return COLORES_MAP[color] || 'bg-gray-500';
};

export const getClinicaBorderColor = (color: string): string => {
  const borderMap: { [key: string]: string } = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    yellow: 'border-yellow-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    orange: 'border-orange-500',
    red: 'border-red-500',
    cyan: 'border-cyan-500',
  };
  return borderMap[color] || 'border-gray-500';
};

export const getClinicaTextColor = (color: string): string => {
  const textMap: { [key: string]: string } = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    cyan: 'text-cyan-500',
  };
  return textMap[color] || 'text-gray-500';
};

export const getClinicaBgColor = (color: string): string => {
  const bgMap: { [key: string]: string } = {
    blue: 'bg-blue-500/10',
    green: 'bg-green-500/10',
    yellow: 'bg-yellow-500/10',
    purple: 'bg-purple-500/10',
    pink: 'bg-pink-500/10',
    orange: 'bg-orange-500/10',
    red: 'bg-red-500/10',
    cyan: 'bg-cyan-500/10',
  };
  return bgMap[color] || 'bg-gray-500/10';
};