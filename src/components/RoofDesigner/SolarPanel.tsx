import React, { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarPanelProps extends GroupProps {
  isSelected?: boolean;
  isValid?: boolean;
  tilt?: number;
}

export const SolarPanel: React.FC<SolarPanelProps> = ({ 
  isSelected = false, 
  isValid = true,
  tilt = 0,
  ...props 
}) => {
  
  // Dimensions for geometric panel (approx 1.7m x 1.0m)
  const width = 1.7;
  const length = 1.0;
  const thickness = 0.04;
  
  // Convert tilt to radians
  const tiltRad = (tilt * Math.PI) / 180;
  
  // Visual Colors
  const errorColor = new THREE.Color('#ff4444');
  const selectedColor = new THREE.Color('#4488ff');
  const frameColor = new THREE.Color('#d1d5db'); // Light Gray
  const cellColor = new THREE.Color('#1f2937'); // Dark Gray

  // Calculations for dynamic parts
  // We want the panel to be centered on 'props.position' when flat.
  // This means the Hinge (Back Edge) is at z = -length/2 relative to the center.
  const hingeZ = -length / 2;

  // Front edge (highest point) position relative to the Hinge
  // In local Hinge space:
  // Z_tip = length * cos(tilt)
  // Y_tip = length * sin(tilt)
  const tipLocalY = length * Math.sin(tiltRad);
  const tipLocalZ = length * Math.cos(tiltRad);

  // Leg Height matches the tip height
  const legHeight = Math.max(tipLocalY, 0.05);

  return (
    <group {...props}>
      {/* 
        Container Offset:
        Shift everything by hingeZ so that (0,0,0) of this inner group 
        is the Hinge Point (Back Edge of the panel).
        The entire assembly pivots relationships from here.
      */}
      <group position={[0, 0, hingeZ]}>
      
        {/* ROTATING PART: The Solar Panel Itself */}
        <group rotation={[0, 0, 0]}>
          {/* 
            Geometry Offset:
            The panel box is centered at (0,0,0) by default.
            We shift it by +length/2 in Z so its "back edge" aligns with the rotation origin.
            We shift it by +thickness/2 in Y so it sits ON the hinge, not passing through it.
          */}
          <group position={[0, thickness/2, length/2]}>
              
              <mesh castShadow receiveShadow>
                <boxGeometry args={[width, thickness, length]} />
                <meshStandardMaterial color={frameColor} roughness={0.5} metalness={0.5} />
              </mesh>
              
              
              <mesh position={[0, thickness/2 + 0.002, 0]} receiveShadow>
                <boxGeometry args={[width - 0.1, 0.005, length - 0.1]} />
                <meshStandardMaterial color={cellColor} roughness={0.2} metalness={0.1} />
              </mesh>

              
              {(isSelected || !isValid) && (
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[width + 0.05, thickness + 0.05, length + 0.05]} />
                  <meshBasicMaterial 
                    color={!isValid ? errorColor : selectedColor} 
                    transparent 
                    opacity={0.3} 
                    depthTest={false}
                  />
                  <Edges color={!isValid ? '#ff0000' : '#0066ff'} linewidth={2} />
                </mesh>
              )}
          </group>
        </group>

        
        {tilt > 1 && (
          <group>
             {(() => {
                const legOffsetX = 0.6; 
                return (
                  <>
                    <mesh position={[-legOffsetX, legHeight / 2, tipLocalZ]} castShadow>
                      <cylinderGeometry args={[0.02, 0.02, legHeight]} />
                      <meshStandardMaterial color="#888" />
                    </mesh>
                    
                    <mesh position={[legOffsetX, legHeight / 2, tipLocalZ]} castShadow>
                      <cylinderGeometry args={[0.02, 0.02, legHeight]} />
                      <meshStandardMaterial color="#888" />
                    </mesh>
                    
                     <mesh position={[0, 0.01, length/2]} receiveShadow>
                        <boxGeometry args={[width * 0.8, 0.02, length]} />
                        <meshStandardMaterial color="#444" transparent opacity={0.3} />
                    </mesh>
                  </>
                );
             })()}
          </group>
        )}
      </group>
    </group>
  );
};
