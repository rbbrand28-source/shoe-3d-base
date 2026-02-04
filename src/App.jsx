import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState } from "react";

function PlaceholderShoe() {
  const meshRef = useRef();
  const [isInteracting, setIsInteracting] = useState(false);
  const idleRotation = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Gentle idle motion (alive, not spinning)
    if (!isInteracting) {
      idleRotation.current += delta * 0.15;
      meshRef.current.rotation.y = idleRotation.current;
      meshRef.current.rotation.x = Math.sin(idleRotation.current * 0.3) * 0.05;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerDown={() => setIsInteracting(true)}
      onPointerUp={() => setIsInteracting(false)}
    >
      <boxGeometry args={[2, 0.7, 0.8]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.35}
        metalness={0.1}
      />
    </mesh>
  );
}

export default function App() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{
          position: [3, 1.8, 4.5],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        dpr={[1, 1.5]}
      >
        {/* Ambient base */}
        <ambientLight intensity={0.35} />

        {/* Key light */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow={false}
        />

        {/* Rim / edge definition */}
        <directionalLight
          position={[-5, 2, -5]}
          intensity={0.6}
        />

        <PlaceholderShoe />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={3.5}
          maxDistance={6}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
