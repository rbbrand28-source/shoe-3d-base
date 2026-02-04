import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const PRODUCT_VARIANTS = [
  {
    name: "Obsidian Black",
    line: "Future Runner",
    material: "Matte Composite",
    color: "#1a1a1a"
  },
  {
    name: "Stone Grey",
    line: "Future Runner",
    material: "Engineered Mesh",
    color: "#b5b5b0"
  },
  {
    name: "Ivory White",
    line: "Future Runner",
    material: "Performance Knit",
    color: "#f2f2ee"
  }
];

function Environment({ active }) {
  const fogRef = useRef();
  const sphereRef = useRef();
  const warmFactor = useRef(0);

  useFrame((_, delta) => {
    warmFactor.current = THREE.MathUtils.lerp(
      warmFactor.current,
      active ? 1 : 0,
      0.02
    );

    if (fogRef.current) {
      fogRef.current.density = THREE.MathUtils.lerp(
        fogRef.current.density,
        active ? 0.045 : 0.03,
        0.02
      );
    }

    if (sphereRef.current) {
      sphereRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        sphereRef.current.material.emissiveIntensity,
        active ? 0.35 : 0.2,
        0.02
      );
    }
  });

  return (
    <>
      <fogExp2 ref={fogRef} args={["#0b0b0c", 0.03]} />
      <mesh ref={sphereRef} scale={50}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          side={THREE.BackSide}
          color="#0f0f12"
          emissive="#1a1a1f"
          emissiveIntensity={0.2}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </>
  );
}

function CameraPresence() {
  const base = useRef(new THREE.Vector3());
  const t = useRef(0);

  useFrame(({ camera }, delta) => {
    t.current += delta * 0.15;
    base.current.set(
      camera.position.x,
      camera.position.y,
      camera.position.z
    );

    camera.position.x += Math.sin(t.current) * 0.002;
    camera.position.y += Math.sin(t.current * 0.7) * 0.002;
  });

  return null;
}

function PlaceholderShoe({ onFirstInteraction }) {
  const meshRef = useRef();
  const materialRef = useRef();

  const [variantIndex, setVariantIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const targetColor = useRef(new THREE.Color(PRODUCT_VARIANTS[0].color));
  const idle = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    idle.current += delta;

    meshRef.current.rotation.y += delta * 0.06;
    meshRef.current.rotation.x =
      Math.sin(idle.current * 0.4) * 0.035;

    const tilt = isHovering ? 0.12 : 0;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      tilt,
      0.06
    );

    materialRef.current.color.lerp(targetColor.current, 0.05);
  });

  const interact = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      onFirstInteraction();
    }

    const next = (variantIndex + 1) % PRODUCT_VARIANTS.length;
    setVariantIndex(next);
    targetColor.current.set(PRODUCT_VARIANTS[next].color);
  };

  const active = PRODUCT_VARIANTS[variantIndex];

  return (
    <>
      <mesh
        ref={meshRef}
        onClick={interact}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        <boxGeometry args={[2, 0.7, 0.8]} />
        <meshStandardMaterial
          ref={materialRef}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {hasInteracted && (
        <Html
          position={[0, -1.1, 0]}
          center
          style={{
            color: "#e6e6e6",
            fontSize: "14px",
            letterSpacing: "0.04em",
            textAlign: "center",
            pointerEvents: "none"
          }}
        >
          <div>
            <div style={{ opacity: 0.9 }}>{active.name}</div>
            <div style={{ opacity: 0.5, fontSize: "12px" }}>
              {active.line} · {active.material}
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

export default function App() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        camera={{
          position: [3.2, 1.9, 4.6],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 2, -5]} intensity={0.6} />

        <Environment active={revealed} />
        <CameraPresence />

        <PlaceholderShoe onFirstInteraction={() => setRevealed(true)} />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={3.5}
          maxDistance={6}
        />
      </Canvas>
    </div>
  );
}