import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface VacuumGaugeProps {
  score: number;
}

const VacuumGauge: React.FC<VacuumGaugeProps> = ({ score }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color calculation
  const getColor = (s: number) => {
    if (s < 40) return '#86868B'; // Apple Gray
    if (s < 75) return '#0071E3'; // Apple Blue
    return '#34C759'; // Apple Green
  };

  const color = getColor(score);

  return (
    <div 
      className="flex flex-col items-center justify-center h-full w-full relative group cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            stroke="#E5E5EA"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <motion.circle
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            className="text-4xl font-semibold tracking-tight text-apple-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <motion.div 
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-apple-subtext uppercase tracking-wider"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Vacuum Index
        <Info className="w-3 h-3 opacity-50" />
      </motion.div>

      {/* Glassmorphism Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 bottom-full mb-2 w-48 p-3 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-hover text-left"
          >
            <p className="text-[11px] leading-relaxed text-apple-text font-medium">
              Measures the gap between what people ask for and what they find. High score means high opportunity.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VacuumGauge;