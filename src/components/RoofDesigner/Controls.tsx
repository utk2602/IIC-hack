import React from 'react';
import { Camera, Grid, Ruler, Maximize } from 'lucide-react';
import { ViewStats } from './types/roof.types';

interface ControlsProps {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  showMeasurements: boolean;
  setShowMeasurements: (show: boolean) => void;
  onResetCamera: () => void;
  stats: ViewStats;
}

export const Controls: React.FC<ControlsProps> = ({
  showGrid,
  setShowGrid,
  showMeasurements,
  setShowMeasurements,
  onResetCamera,
  stats,
}) => {
  return (
    <>
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm">
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
      </div>

      {/* Bottom Left Stats */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-xl shadow-lg backdrop-blur-sm min-w-[240px]">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Maximize size={16} />
          Roof Statistics
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Total Area</span>
            <span className="text-sm font-mono font-bold text-gray-900">{stats.area.toFixed(1)} m²</span>
          </div>
          
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Usable Space</span>
            <span className="text-sm font-mono font-bold text-green-600">{stats.availableSpace.toFixed(1)} m²</span>
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
