import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import { Roof } from './Roof';
import { Ground } from './Ground';
import { Lights } from './Lights';
import { Controls } from './Controls';
import { useRoofDimensions } from './hooks/useRoofDimensions';

// Inner component to handle camera/scene logic that requires useThree
const SceneController = ({ onStatsUpdate }: { onStatsUpdate: (angle: string) => void }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (controlsRef.current) {
      const angle = controlsRef.current.getAzimuthalAngle();
      // Convert view angle to readable degrees (0-360)
      const degrees = Math.round(((angle * 180) / Math.PI + 360) % 360);
      onStatsUpdate(`${degrees}°`);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      minPolarAngle={Math.PI * (5 / 180)} // 5 degrees
      maxPolarAngle={Math.PI * (85 / 180)} // 85 degrees
      maxDistance={50}
      minDistance={5}
    />
  );
};

export const RoofDesigner: React.FC = () => {
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const { dimensions, stats } = useRoofDimensions();
  const [viewAngle, setViewAngle] = useState('0°');
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const handleResetCamera = () => {
    // We can interact with the OrbitControls via ref in SceneController, 
    // or just reset the camera position here which OrbitControls will pick up on next frame maybe,
    // but the cleanest way in R3F is often just remounting or passing a trigger.
    // However, for simplicity here, we'll let the user manually orbit back or 
    // implemented proper imperative handle reset would require context or ref forwarding.
    // For this demo, let's just log or simplified action.
    // Ideally: store controls ref in a context or pass it up.
    // Let's implement a simple "Key" reset technique for now which forces re-render of controls
    // or we can access the camera directly.
    if (cameraRef.current) {
       cameraRef.current.position.set(15, 12, 15);
       cameraRef.current.lookAt(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 relative">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }}
          className="bg-white"
        >
          <PerspectiveCamera 
            ref={cameraRef}
            makeDefault 
            position={[15, 12, 15]} 
            fov={50}
          />
          
          <SceneController onStatsUpdate={setViewAngle} />

          <Lights />
          
          <Suspense fallback={null}>
            <group>
              <Roof 
                dimensions={dimensions} 
                showMeasurements={showMeasurements}
              />
              <Ground showGrid={showGrid} />
            </group>
          </Suspense>
        </Canvas>

        {/* UI Overlay */}
        <Controls
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showMeasurements={showMeasurements}
          setShowMeasurements={setShowMeasurements}
          onResetCamera={handleResetCamera}
          stats={{ ...stats, viewAngle }}
        />
      </div>
    </div>
  );
};

export default RoofDesigner;
