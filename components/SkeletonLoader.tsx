import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingSteps = [
  "Aggregating 1.2M intent signals...",
  "Auditing 412 local business nodes...",
  "Gemini synthesizing market vacuum...",
  "Drafting Strategic Market Entry Plan..."
];

const SkeletonLoader: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-0 pb-12 relative flex flex-col gap-8">
       {/* Skeleton Report Structure */}
      <div className="w-full opacity-60 flex flex-col gap-6">
        <div className="w-full h-32 bg-gray-100/50 rounded-2xl animate-pulse" />
        <div className="flex gap-4">
            <div className="w-1/3 h-64 bg-gray-100/50 rounded-2xl animate-pulse" />
            <div className="w-2/3 h-64 bg-gray-100/50 rounded-2xl animate-pulse" />
        </div>
        <div className="w-full h-80 bg-gray-100/50 rounded-2xl animate-pulse" />
      </div>

      {/* Pulse Text Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 top-[-100px]">
        <div className="bg-white/90 backdrop-blur-xl px-8 py-6 rounded-2xl border border-apple-border shadow-hover flex flex-col items-center max-w-md text-center">
            <div className="flex items-center gap-3 mb-4">
                 <div className="flex gap-1.5">
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-black rounded-full" />
                    <motion.div animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-black rounded-full" />
                    <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-black rounded-full" />
                 </div>
                 <span className="text-xs font-semibold uppercase tracking-wider text-apple-text">Agentic Process</span>
            </div>
            
            <div className="h-12 overflow-hidden relative w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={stepIndex}
                        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                        className="text-sm font-medium text-apple-subtext"
                    >
                        {loadingSteps[stepIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;