import React from 'react';

export const Lights: React.FC = () => {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
      {/* Natural sky lighting */}
      <hemisphereLight 
        args={['#ffffff', '#bbbbff', 0.5]} 
        position={[0, 50, 0]} 
      />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
    </>
  );
};
