import React from 'react';
import RoofDesigner from '../components/RoofDesigner/RoofDesigner';

export const Visualizer = () => {
  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-2xl font-bold text-slate-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm">
          3D Designer
        </h1>
      </div>
      <RoofDesigner />
    </div>
  );
};
