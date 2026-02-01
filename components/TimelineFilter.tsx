import React from 'react';
import { motion } from 'framer-motion';
import { TimelineOption } from '../types';

interface TimelineFilterProps {
  selected: TimelineOption;
  onChange: (option: TimelineOption) => void;
  disabled?: boolean;
}

const options: TimelineOption[] = ['Today', '7 Days', '30 Days', '90 Days'];

const TimelineFilter: React.FC<TimelineFilterProps> = ({ selected, onChange, disabled }) => {
  return (
    <motion.div 
      className="inline-flex bg-white/80 backdrop-blur-xl border border-apple-border/60 p-1.5 rounded-full shadow-soft"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          disabled={disabled}
          className={`
            relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
            ${selected === option ? 'text-white' : 'text-apple-subtext hover:text-apple-text'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {selected === option && (
            <motion.div
              layoutId="timeline-pill"
              className="absolute inset-0 bg-black rounded-full shadow-md"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option}</span>
        </button>
      ))}
    </motion.div>
  );
};

export default TimelineFilter;