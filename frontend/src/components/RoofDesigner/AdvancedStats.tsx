import React from 'react';
import { ShieldCheck, AlertTriangle, Calendar, BrainCircuit, TrendingDown, Info, CheckCircle2 } from 'lucide-react';
import { ViewStats } from './types/roof.types';

interface AdvancedStatsProps {
  stats: ViewStats;
}

export const AdvancedStats: React.FC<AdvancedStatsProps> = ({ stats }) => {
  const efficiencyLoss = (100 - stats.efficiency).toFixed(1);
  const degradation = 0.5; // Monthly degradation rate example
  const nextCleaning = new Date();
  nextCleaning.setDate(nextCleaning.getDate() + 14);

  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-4 w-96 max-h-[60vh] overflow-y-auto z-10 custom-scrollbar pr-1 pb-1">
      {/* Real-time Performance Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-blue-600" />
            AI Performance Analysis
          </h3>
          <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </span>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Main Efficiency Meter */}
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-gray-600">Current Efficiency</span>
              <span className="text-2xl font-bold text-blue-600">{stats.efficiency.toFixed(1)}%</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                  stats.efficiency > 80 ? 'bg-gradient-to-r from-blue-500 to-green-400' : 
                  stats.efficiency > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-red-500'
                }`}
                style={{ width: `${stats.efficiency}%` }}
              />
            </div>
          </div>

          {/* Loss Breakdown */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Loss Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  Incidence Angle
                </span>
                <span className="font-medium text-slate-800">{(100 - stats.efficiency).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  Thermal Drift
                </span>
                <span className="font-medium text-slate-800">2.1%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  Soiling (Dust)
                </span>
                <span className="font-medium text-slate-800">1.4%</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Degradation & Alerts */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-4 space-y-4">
          {/* Cleaning Schedule */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">Recommended Cleaning</h4>
              <p className="text-xs text-gray-500 mt-1">
                Next scheduled: <span className="font-medium text-gray-700">{nextCleaning.toLocaleDateString()}</span>
              </p>
              <div className="mt-2 text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded inline-block">
                +3.2% Efficiency gain est.
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Degradation Alert */}
          <div className="flex items-start gap-3">
             <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
               <TrendingDown className="w-5 h-5" />
             </div>
             <div>
               <h4 className="font-semibold text-gray-800 text-sm">Degradation Alert</h4>
               <p className="text-xs text-gray-500 mt-1">
                 Panels degrading at <span className="font-medium text-amber-600">0.05% / month</span> above threshold.
               </p>
               <button className="text-xs text-blue-600 underline mt-1">View detailed report</button>
             </div>
          </div>
          
           <div className="h-px bg-gray-100" />

           {/* Health Check */}
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                System Health
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                OPTIMAL
              </span>
           </div>
        </div>
      </div>
    </div>
  );
};
