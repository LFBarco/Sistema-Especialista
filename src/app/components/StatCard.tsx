import { LucideIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { useApp } from '../App';
import { motion } from 'motion/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  trend: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  description?: string;
  changeValue?: number;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  trend, 
  onClick,
  description,
  changeValue 
}: StatCardProps) {
  const { darkMode } = useApp();
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <motion.div
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ 
              scale: 1.02,
              y: -4,
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="group relative rounded-xl border p-6 transition-all duration-200"
            style={{
              backgroundColor: darkMode ? '#111827' : '#FFFFFF',
              borderColor: darkMode ? '#1F2937' : '#E2E8F0',
              cursor: onClick ? 'pointer' : 'default',
              boxShadow: isHovered 
                ? darkMode 
                  ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                : 'none'
            }}
          >
            {/* Subtle glow on hover */}
            {isHovered && (
              <div 
                className="absolute inset-0 rounded-xl opacity-20 blur-xl transition-opacity duration-200"
                style={{ backgroundColor: color }}
              />
            )}

            <div className="relative flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Title with info icon */}
                <div className="flex items-center gap-2">
                  <p 
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                  >
                    {title}
                  </p>
                  {description && (
                    <Info 
                      className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity"
                      style={{ color: darkMode ? '#9CA3AF' : '#64748B' }}
                    />
                  )}
                </div>

                {/* Value - Jerarquía principal */}
                <p 
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: darkMode ? '#FFFFFF' : '#0F172A' }}
                >
                  {value}
                </p>

                {/* Change indicator - Mejorado */}
                <div className="flex items-center gap-2">
                  {/* Trend icon with animated background */}
                  {trend !== 'neutral' && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center justify-center w-5 h-5 rounded"
                      style={{
                        backgroundColor: trend === 'up' 
                          ? darkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)'
                          : darkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'
                      }}
                    >
                      {trend === 'up' && <TrendingUp className="w-3 h-3" style={{ color: '#22C55E' }} />}
                      {trend === 'down' && <TrendingDown className="w-3 h-3" style={{ color: '#EF4444' }} />}
                    </motion.div>
                  )}
                  {trend === 'neutral' && (
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded"
                      style={{
                        backgroundColor: darkMode ? 'rgba(156, 163, 175, 0.15)' : 'rgba(156, 163, 175, 0.1)'
                      }}
                    >
                      <Minus className="w-3 h-3" style={{ color: darkMode ? '#9CA3AF' : '#64748B' }} />
                    </div>
                  )}

                  {/* Change text */}
                  <span 
                    className="text-xs font-semibold"
                    style={{ 
                      color: trend === 'up' 
                        ? '#22C55E' 
                        : trend === 'down' 
                          ? '#EF4444' 
                          : darkMode ? '#9CA3AF' : '#64748B'
                    }}
                  >
                    {change}
                  </span>
                </div>
              </div>

              {/* Icon - Diseño mejorado */}
              <motion.div
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="flex-shrink-0 p-3 rounded-xl"
                style={{
                  background: darkMode
                    ? `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
                    : `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                  border: `1px solid ${color}${darkMode ? '30' : '20'}`,
                  boxShadow: isHovered 
                    ? `0 8px 16px -4px ${color}40`
                    : 'none'
                }}
              >
                <Icon 
                  className="w-6 h-6"
                  style={{ color }}
                  strokeWidth={2.5}
                />
              </motion.div>
            </div>

            {/* Subtle bottom border accent on hover */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
              style={{ 
                backgroundColor: color,
                originX: 0
              }}
            />
          </motion.div>
        </TooltipTrigger>

        {description && (
          <TooltipContent 
            side="top"
            className="max-w-xs"
            style={{
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              borderColor: darkMode ? '#374151' : '#E2E8F0',
              color: darkMode ? '#E5E7EB' : '#0F172A'
            }}
          >
            <p className="text-xs font-medium">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
