import React from 'react';
import { Camera, Grid, Ruler, Maximize, Trash2, Zap, RotateCw } from 'lucide-react';
import { ViewStats } from './types/roof.types';

interface ControlsProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  onResetCamera: () => void;
  onClearPanels: () => void;
  onTiltChange: (tilt: number) => void;
  stats: ViewStats;
}

export const Controls: React.FC<ControlsProps> = ({
  showGrid,
  setShowGrid,
  showMeasurements,
  setShowMeasurements,
  onResetCamera,
  onClearPanels,
  onTiltChange,
  stats,
}) => {
  return (
    <>
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm pointer-events-auto w-64">
        <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">View Options</h3>
        
        <button
          onClick={onResetCamera}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="Reset Camera"
        >
          <Camera size={18} />
          <span>Reset View</span>
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showGrid ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Grid size={18} />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setShowMeasurements(!showMeasurements)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            showMeasurements ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Ruler size={18} />
          <span>Measurements</span>
        </button>

        <div className="my-2 border-t border-gray-200 pt-2">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                <RotateCw size={14} />
                Panel Tilt: {stats.panelTilt}°
            </h4>
            <input 
                type="range" 
                min="0" 
                max="60" 
                step="1"
                value={stats.panelTilt}
                onChange={(e) => onTiltChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>

        <hr className="my-1 border-gray-200" />

        <button
          onClick={onClearPanels}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          <span>Clear Panels</span>
        </button>
      </div>

      {/* Bottom Left Stats */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm min-w-[240px] pointer-events-auto">
        <div className="flex items-center gap-2 mb-3 text-gray-500">
           <Zap size={16} className="text-yellow-500" />
           <h3 className="text-sm font-semibold uppercase tracking-wider">System Stats</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Panels</span>
            <span className="text-sm font-mono font-bold text-gray-900">{stats.panelCount}</span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">System Size</span>
            <span className="text-sm font-mono font-bold text-blue-600">{stats.systemSize.toFixed(1)} kW</span>
          </div>

           <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Tilt Angle</span>
            <span className="text-sm font-mono font-bold text-gray-900">{stats.panelTilt}°</span>
          </div>

          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Total Area</span>
            <span className="text-sm font-mono font-bold text-gray-900">{stats.area.toFixed(1)} m²</span>
          </div>

          <div className="flex justify-between items-center pt-1">
             <span className="text-xs text-gray-400">View Angle</span>
             <span className="text-xs font-mono text-gray-400">{stats.viewAngle}</span>
          </div>
        </div>
      </div>
    </>
  );
};
