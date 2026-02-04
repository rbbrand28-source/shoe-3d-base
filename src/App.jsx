import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function PlaceholderShoe() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 0.7, 0.8]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  );
}

export default function App() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <PlaceholderShoe />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
