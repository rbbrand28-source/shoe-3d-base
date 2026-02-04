import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

/* -------------------- PRODUCT IDENTITY -------------------- */

const PRODUCT_VARIANTS = [
  {
    name: "Obsidian Black",
    line: "Future Runner",
    material: "Matte Composite",
    color: "#1a1a1a",
    luminance: 0.1,
    finishBias: 0.05
  },
  {
    name: "Stone Grey",
    line: "Future Runner",
    material: "Engineered Mesh",
    color: "#b5b5b0",
    luminance: 0.55,
    finishBias: 0.0
  },
  {
    name: "Ivory White",
    line: "Future Runner",
    material: "Performance Knit",
    color: "#f2f2ee",
    luminance: 0.85,
    finishBias: -0.05
  }
];

/* -------------------- GROUND -------------------- */

function Ground({ variant, motionEnergy }) {
  const planeRef = useRef();

  useFrame(() => {
    if (!planeRef.current) return;

    const baseOpacity = THREE.MathUtils.lerp(
      0.38,
      0.2,
      variant.luminance
    );

    const motionBoost = THREE.MathUtils.clamp(motionEnergy * 0.6, 0, 0.18);

    planeRef.current.material.opacity = THREE.MathUtils.lerp(
      planeRef.current.material.opacity,
      baseOpacity + motionBoost,
      0.08
    );
  });

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[10, 10]} />
      <shadowMaterial transparent opacity={0.3} />
    </mesh>
  );
}

/* -------------------- ENVIRONMENT -------------------- */

function Environment({ variant, locked }) {
  const fogRef = useRef();
  const sphereRef = useRef();

  useFrame(() => {
    if (!fogRef.current || !sphereRef.current) return;

    const fogTarget = THREE.MathUtils.lerp(
      0.028,
      0.042,
      1 - variant.luminance
    );

    fogRef.current.density = THREE.MathUtils.lerp(
      fogRef.current.density,
      locked ? fogTarget : fogTarget * 0.85,
      0.02
    );

    const emissiveTarget = THREE.MathUtils.lerp(
      0.18,
      0.3,
      1 - variant.luminance
    );

    sphereRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
      sphereRef.current.material.emissiveIntensity,
      emissiveTarget,
      0.02
    );
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
        />
      </mesh>
    </>
  );
}

/* -------------------- CAMERA PRESENCE -------------------- */

function CameraAuthority() {
  const t = useRef(0);

  useFrame(({ camera }, delta) => {
    t.current += delta * 0.12;
    camera.position.x += Math.sin(t.current) * 0.0015;
    camera.position.y += Math.sin(t.current * 0.7) * 0.0012;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* -------------------- SHOE CORE -------------------- */

function PlaceholderShoe({ variantIndex, onVariantChange, onFirstInteract }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const rimLightRef = useRef();

  const variant = PRODUCT_VARIANTS[variantIndex];
  const targetColor = useRef(new THREE.Color(variant.color));

  const angularVelocity = useRef(0);
  const rotationVelocity = useRef(0);
  const isUserActive = useRef(false);
  const motionEnergy = useRef(0);

  const [textVisible, setTextVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    if (!isUserActive.current) {
      rotationVelocity.current = THREE.MathUtils.lerp(
        rotationVelocity.current,
        0.045,
        0.02
      );
    }

    angularVelocity.current = THREE.MathUtils.lerp(
      angularVelocity.current,
      rotationVelocity.current,
      0.08
    );

    meshRef.current.rotation.y += angularVelocity.current * delta;
    rotationVelocity.current *= 0.95;

    motionEnergy.current = THREE.MathUtils.lerp(
      motionEnergy.current,
      Math.abs(angularVelocity.current),
      0.1
    );

    materialRef.current.color.lerp(targetColor.current, 0.05);
    materialRef.current.roughness = THREE.MathUtils.lerp(
      materialRef.current.roughness,
      0.45 + variant.finishBias,
      0.05
    );

    if (rimLightRef.current) {
      rimLightRef.current.position.copy(state.camera.position);
      rimLightRef.current.intensity = THREE.MathUtils.lerp(
        rimLightRef.current.intensity,
        THREE.MathUtils.lerp(
          0.4,
          0.2,
          variant.luminance
        ) + motionEnergy.current * 0.18,
        0.05
      );
    }

    if (motionEnergy.current > 0.6 && textVisible) setTextVisible(false);
    if (motionEnergy.current < 0.12 && !textVisible) setTextVisible(true);
  });

  const handlePointerDown = () => {
    isUserActive.current = true;
    if (!hasInteracted) {
      setHasInteracted(true);
      onFirstInteract();
    }
  };

  const handlePointerUp = () => {
    isUserActive.current = false;
  };

  const handleClick = () => {
    const next = (variantIndex + 1) % PRODUCT_VARIANTS.length;
    targetColor.current.set(PRODUCT_VARIANTS[next].color);
    onVariantChange(next);
  };

  return (
    <>
      <directionalLight ref={rimLightRef} intensity={0.25} />

      <mesh
        ref={meshRef}
        castShadow
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      >
        <boxGeometry args={[2, 0.7, 0.8]} />
        <meshStandardMaterial
          ref={materialRef}
          roughness={0.45}
          metalness={0.12}
          envMapIntensity={0.4}
        />
      </mesh>

      {textVisible && (
        <Html
          position={[0, -1.15, 0]}
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
            <div>{variant.name}</div>
            <div style={{ opacity: 0.5, fontSize: "12px" }}>
              {variant.line} · {variant.material}
            </div>
          </div>
        </Html>
      )}

      <Ground variant={variant} motionEnergy={motionEnergy.current} />
    </>
  );
}

/* -------------------- APP ROOT -------------------- */

export default function App() {
  const [variantIndex, setVariantIndex] = useState(0);
  const [locked, setLocked] = useState(false);

  return (
    <div className="w-full h-full bg-black">
      <Canvas
        shadows
        camera={{
          position: [3.2, 1.9, 4.6],
          fov: 45,
          near: 0.1,
          far: 100
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.25} />

        <directionalLight
          position={[5, 6, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={15}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        <directionalLight position={[-5, 2, -5]} intensity={0.6} />

        <Environment
          variant={PRODUCT_VARIANTS[variantIndex]}
          locked={locked}
        />

        <CameraAuthority />

        <PlaceholderShoe
          variantIndex={variantIndex}
          onVariantChange={setVariantIndex}
          onFirstInteract={() => setLocked(true)}
        />

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.12}
          rotateSpeed={0.55}
          zoomSpeed={0.8}
          minDistance={3.5}
          maxDistance={6}
        />
      </Canvas>
    </div>
  );
}