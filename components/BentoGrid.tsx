import React, { useState } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { LocantInsight } from '../types';
import { ExternalLink, Info } from 'lucide-react';

interface BentoGridProps {
  data: LocantInsight;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
  }
};

// --- Sub-Components ---

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div 
            className="relative inline-flex items-center justify-center ml-2 cursor-help"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Info className="w-4 h-4 text-apple-subtext/60 hover:text-apple-subtext transition-colors" />
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute bottom-full mb-2 w-56 p-3 bg-black/90 text-white text-xs rounded-xl shadow-xl backdrop-blur-sm z-50 leading-relaxed text-center left-1/2 -translate-x-1/2"
                    >
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black/90" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FunnelSection: React.FC<{ data: LocantInsight['funnel'] }> = ({ data }) => {
  const formatNum = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toString();
  };

  return (
    <div className="w-full flex flex-col items-center py-10 relative">
        <svg viewBox="0 0 400 300" className="w-full max-w-lg drop-shadow-2xl">
             <defs>
                 <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" style={{stopColor:'#F5F5F7', stopOpacity:1}} />
                     <stop offset="100%" style={{stopColor:'#E5E5EA', stopOpacity:1}} />
                 </linearGradient>
                 <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" style={{stopColor:'#E5E5EA', stopOpacity:1}} />
                     <stop offset="100%" style={{stopColor:'#D1D1D6', stopOpacity:1}} />
                 </linearGradient>
                 <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" style={{stopColor:'#1D1D1F', stopOpacity:1}} />
                     <stop offset="100%" style={{stopColor:'#000000', stopOpacity:1}} />
                 </linearGradient>
             </defs>
             
             {/* Layer 1: Top Trapezoid */}
             <path d="M 0 0 L 400 0 L 340 90 L 60 90 Z" fill="url(#grad1)" />
             <text x="200" y="30" textAnchor="middle" className="text-xs uppercase font-bold fill-[#86868B] tracking-wider">Total Market Signal</text>
             <text x="200" y="62" textAnchor="middle" className="text-3xl font-semibold fill-[#1D1D1F]">{formatNum(data.totalSignal)}</text>
             <text x="200" y="80" textAnchor="middle" className="text-xs fill-[#86868B]">Queries</text>

             {/* Layer 2: Middle Trapezoid */}
             <path d="M 60 95 L 340 95 L 280 190 L 120 190 Z" fill="url(#grad2)" />
             <text x="200" y="128" textAnchor="middle" className="text-xs uppercase font-bold fill-[#636366] tracking-wider">Active Intent Users</text>
             <text x="200" y="158" textAnchor="middle" className="text-3xl font-semibold fill-[#1D1D1F]">{formatNum(data.activeIntentUsers)}</text>
             <text x="200" y="176" textAnchor="middle" className="text-xs fill-[#636366]">Residents</text>

             {/* Layer 3: Bottom Trapezoid/Rectangle */}
             <path d="M 120 195 L 280 195 L 280 280 L 120 280 Z" fill="url(#grad3)" />
             <text x="200" y="228" textAnchor="middle" className="text-xs uppercase font-bold fill-[#8E8E93] tracking-wider">Supply Census</text>
             <text x="200" y="255" textAnchor="middle" className="text-3xl font-semibold fill-white">{data.supplyCensus}</text>
             <text x="200" y="272" textAnchor="middle" className="text-xs fill-[#8E8E93]">Providers</text>
        </svg>
    </div>
  );
};

const SegmentsTable: React.FC<{ data: LocantInsight['segments'] }> = ({ data }) => (
  <div className="w-full bg-apple-card border border-apple-border rounded-2xl overflow-hidden shadow-soft">
      <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50/50 border-b border-apple-border text-xs uppercase font-bold text-apple-subtext tracking-wider">
          <div className="col-span-5">Category</div>
          <div className="col-span-3 text-right">Volume</div>
          <div className="col-span-2 text-right">Growth</div>
          <div className="col-span-2 text-right">Sentiment</div>
      </div>
      {data.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-apple-border last:border-0 hover:bg-white transition-colors items-center group">
             <div className="col-span-5 font-semibold text-apple-text text-base flex items-center">
                 {item.category}
                 <Tooltip text={`Aggregated from search clusters in the ${item.category} vertical.`} />
             </div>
             <div className="col-span-3 text-right font-mono text-sm text-gray-600">{item.volume.toLocaleString()}</div>
             <div className="col-span-2 text-right flex justify-end">
                <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${item.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {Math.round(item.growth) > 0 ? '+' : ''}{Math.round(item.growth)}%
                </span>
             </div>
             <div className="col-span-2 text-right text-sm text-apple-subtext italic">{item.sentiment}</div>
          </div>
      ))}
  </div>
);

const QuadrantMap: React.FC<{ data: LocantInsight['quadrant'] }> = ({ data }) => {
   return (
       <div className="relative w-full aspect-[4/3] bg-white border border-apple-border rounded-2xl p-8 shadow-inner overflow-hidden">
           
           {/* Grid Lines */}
           <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-px bg-apple-border/50 absolute top-1/2" />
               <div className="h-full w-px bg-apple-border/50 absolute left-1/2" />
           </div>

           {/* Labels */}
           <div className="absolute bottom-4 right-6 text-xs uppercase font-bold text-apple-subtext tracking-wider">High Supply &rarr;</div>
           <div className="absolute top-6 left-4 text-xs uppercase font-bold text-apple-subtext rotate-90 origin-left tracking-wider">&larr; High Demand</div>

           {/* Quadrant Labels */}
           <div className="absolute top-6 left-6 text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">Vacuum Zone</div>
           <div className="absolute top-6 right-6 text-sm font-bold text-gray-400">Saturated</div>
           
           {/* Points */}
           {data.map((point, idx) => (
               <motion.div
                 key={idx}
                 className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer`}
                 style={{ 
                     left: `${point.supplyDensity}%`, 
                     bottom: `${point.demandIntensity}%` // Using bottom for Y axis
                 }}
                 initial={{ opacity: 0, scale: 0 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.1, type: 'spring' }}
               >
                  {point.isVacuum && (
                      <span className="absolute w-16 h-16 bg-purple-500/20 rounded-full animate-ping" />
                  )}
                  <div className={`w-4 h-4 rounded-full border-[3px] shadow-sm z-10 ${point.isVacuum ? 'bg-purple-600 border-white' : 'bg-gray-400 border-white group-hover:bg-gray-600'}`} />
                  <span className={`mt-3 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 ${point.isVacuum ? 'bg-purple-600 text-white opacity-100' : 'bg-white text-apple-text border border-apple-border'}`}>
                      {point.label}
                  </span>
               </motion.div>
           ))}
       </div>
   )
}

const StrategyList: React.FC<{ data: LocantInsight['strategy'] }> = ({ data }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {data.map((step, idx) => (
            <motion.div 
                key={idx} 
                className="bg-apple-card border border-apple-border rounded-2xl p-8 flex flex-col justify-between hover:shadow-hover transition-shadow h-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-base shadow-md">
                        {idx + 1}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-apple-subtext">{step.phase}</span>
                </div>
                
                <div className="mb-6">
                     <h4 className="text-base font-bold text-apple-text mb-3">The Insight</h4>
                     <p className="text-sm text-apple-subtext leading-relaxed bg-gray-50 p-3 rounded-xl border border-apple-border/50">
                        {step.insight}
                     </p>
                </div>
                
                <div>
                     <h4 className="text-base font-bold text-apple-blue mb-3">The Action</h4>
                     <p className="text-base text-apple-text font-semibold leading-relaxed">
                        {step.action}
                     </p>
                </div>
            </motion.div>
        ))}
    </div>
)

// --- Main Report Component ---

const InsightReport: React.FC<BentoGridProps> = ({ data }) => {
  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      
      {/* 1. Executive Summary */}
      <motion.section 
        className="mb-24 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wider text-apple-subtext mb-8 flex items-center justify-center gap-3">
            <span className="w-12 h-px bg-apple-border"></span>
            Executive Summary
            <span className="w-12 h-px bg-apple-border"></span>
        </h3>
        <p className="text-3xl md:text-5xl leading-tight font-serif text-apple-text max-w-4xl mx-auto">
            "{data.narrative}"
        </p>
      </motion.section>

      {/* 2. The Executive Funnel */}
      <motion.section 
        className="mb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold tracking-tight">Executive Funnel</h3>
                <Tooltip text="Visualizes the drop-off from unverified search interest to confirmed business supply." />
            </div>
            <span className="text-xs font-medium text-apple-subtext bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">Live Data</span>
        </div>
        <FunnelSection data={data.funnel} />
      </motion.section>

      {/* 3. Demand Segmentation */}
      <motion.section 
        className="mb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
         <div className="flex items-center gap-3 mb-8 px-4">
             <h3 className="text-2xl font-bold tracking-tight">Demand Segmentation</h3>
             <Tooltip text="Categorizes search intent by volume, growth trajectory, and sentiment analysis." />
         </div>
         <SegmentsTable data={data.segments} />
      </motion.section>

      {/* 4. Quadrant Analysis */}
      <motion.section 
        className="mb-24 bg-gradient-to-br from-[#FBFBFD] to-white p-1 rounded-3xl border border-apple-border shadow-soft"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
         <div className="bg-white rounded-[20px] p-8 md:p-10">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight mb-3">Market Efficiency Quadrant</h3>
                    <p className="text-base text-apple-subtext">The <span className="text-purple-600 font-bold">Purple Zone</span> indicates specific inefficiencies where demand outstrips supply.</p>
                </div>
            </div>
            <QuadrantMap data={data.quadrant} />
         </div>
      </motion.section>

      {/* 5. Strategic Plan */}
      <motion.section 
        className="mb-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
      >
        <div className="flex items-center gap-3 mb-10 px-4">
            <h3 className="text-2xl font-bold tracking-tight">Strategic Market Entry</h3>
             <Tooltip text="A phased action plan derived from the vacuum analysis." />
        </div>
        <StrategyList data={data.strategy} />
      </motion.section>

      {/* Sources */}
      <section className="border-t border-apple-border pt-10 text-center md:text-left">
         <h4 className="text-xs font-bold uppercase tracking-wider text-apple-subtext mb-6">Intelligence Sources</h4>
         <div className="flex flex-wrap gap-4 justify-center md:justify-start">
             {data.sources.map((source, i) => (
                 <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-apple-blue hover:underline bg-blue-50 px-4 py-2 rounded-full transition-colors font-medium">
                     {source.title} <ExternalLink className="w-4 h-4" />
                 </a>
             ))}
         </div>
      </section>

    </div>
  );
};

export default InsightReport;