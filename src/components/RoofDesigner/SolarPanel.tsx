import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';

interface SolarPanelProps extends GroupProps {
  isSelected?: boolean;
  isValid?: boolean;
}

export const SolarPanel: React.FC<SolarPanelProps> = ({ 
  isSelected = false, 
  isValid = true,
  ...props 
}) => {
  const { scene } = useGLTF('/models/solar_panel.glb');
  
  // Clone the scene to allow multiple independent instances
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Apply material overrides or optimizations if needed
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  // Visual feedback colors
  const errorColor = new THREE.Color('#ff4444');
  const selectedColor = new THREE.Color('#4488ff');
  const normalColor = new THREE.Color('#ffffff');

  return (
    <group {...props}>
      <primitive object={clonedScene} />
      
      {/* Selection/Validity Highlight Box */}
      {(isSelected || !isValid) && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.7, 0.1, 1]} /> {/* Approx panel dimensions */}
          <meshBasicMaterial 
            color={!isValid ? errorColor : selectedColor} 
            transparent 
            opacity={0.3} 
            depthTest={false}
          />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(1.7, 0.1, 1)]} />
            <lineBasicMaterial color={!isValid ? '#ff0000' : '#0066ff'} linewidth={2} />
          </lineSegments>
        </mesh>
      )}
    </group>
  );
};

// Preload the model
useGLTF.preload('/models/solar_panel.glb');
