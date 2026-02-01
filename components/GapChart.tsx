import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../types';

interface GapChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 border border-apple-border rounded-xl shadow-soft text-xs">
        <p className="font-semibold text-apple-text mb-1">{label}</p>
        <div className="flex items-center gap-2 text-gray-800">
          <div className="w-2 h-2 rounded-full bg-black" />
          <span>Intent: {payload[0].value}%</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
           <div className="w-2 h-2 rounded-full bg-[#E5E5EA]" />
          <span>Supply: {payload[1].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const GapChart: React.FC<GapChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="flex justify-between items-center mb-4 px-2">
         <h3 className="text-sm font-semibold text-apple-text">Gap Analysis</h3>
         <div className="flex gap-4 text-[10px] text-apple-subtext font-medium uppercase tracking-wide">
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-black"></div> Intent
            </div>
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#E5E5EA]"></div> Supply
            </div>
         </div>
      </div>
      
      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            barGap={4}
          >
            <XAxis 
                dataKey="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#86868B', fontSize: 10 }}
                interval={0}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Bar dataKey="intentDensity" fill="#000000" radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500}>
                 {/* Intent bars are Deep Black */}
            </Bar>
            <Bar dataKey="providerDensity" fill="#E5E5EA" radius={[4, 4, 4, 4]} barSize={12} animationDuration={1500} animationBegin={300}>
                 {/* Supply bars are Soft Gray */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GapChart;