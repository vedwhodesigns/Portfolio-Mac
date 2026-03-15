"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sphere, Environment, Lightformer, Float } from "@react-three/drei";
import React, { Suspense, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

// The blobs that float around behind the glass
function AnimatedBlobs() {
  const blob1 = useRef<THREE.Mesh>(null);
  const blob2 = useRef<THREE.Mesh>(null);
  const blob3 = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  const isDark = theme === "dark";
  
  // Dynamic gradient colors that match premium Apple aesthetic depending on theme
  const c1 = isDark ? "#4338ca" : "#3b82f6"; // Indigo / Blue
  const c2 = isDark ? "#be185d" : "#ec4899"; // Pink
  const c3 = isDark ? "#0f766e" : "#14b8a6"; // Teal

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (blob1.current) {
      blob1.current.position.x = Math.sin(t * 0.4) * 4;
      blob1.current.position.y = Math.cos(t * 0.3) * 3;
      blob1.current.rotation.x = t * 0.1;
    }
    if (blob2.current) {
      blob2.current.position.x = Math.cos(t * 0.5) * -5;
      blob2.current.position.y = Math.sin(t * 0.6) * 2;
      blob2.current.rotation.y = t * 0.2;
    }
    if (blob3.current) {
      blob3.current.position.x = Math.sin(t * 0.2) * 2;
      blob3.current.position.y = Math.cos(t * 0.7) * -3;
      blob3.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      {/* Increased segmentations for smooth blobs */}
      <Sphere ref={blob1} args={[2.5, 64, 64]} position={[-3, 2, 0]}>
        <meshStandardMaterial color={c1} roughness={0.1} metalness={0.5} />
      </Sphere>
      <Sphere ref={blob2} args={[3, 64, 64]} position={[3, -1, -2]}>
        <meshStandardMaterial color={c2} roughness={0.1} metalness={0.5} />
      </Sphere>
      <Sphere ref={blob3} args={[2, 64, 64]} position={[0, -3, 1]}>
        <meshStandardMaterial color={c3} roughness={0.1} metalness={0.5} />
      </Sphere>
    </group>
  );
}

// The main Fullscreen Liquid Glass Plane
function GlassPlane() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Use a slight tint based on day/night mode to match the Figma Light settings (80% and 40 degrees translated to R3F lighting)
  const glassColor = isDark ? "#111111" : "#ffffff";

  return (
    <Float floatIntensity={1} rotationIntensity={0.1} speed={2}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <MeshTransmissionMaterial
            // Translated directly from Figma Glass Object properties:
            ior={1.3}                 // Refraction factor
            thickness={18}            // Depth (18)
            chromaticAberration={2}   // Dispersion mapped to R3F shader values
            anisotropy={0.1}          // Splay simulation
            transmission={1.0}        // Base glass nature
            roughness={0.06}          // Frost (6)
            
            // Needed to ensure true thickness rendering in R3F
            resolution={1024}
            color={glassColor}
            attenuationDistance={1}
            attenuationColor={isDark ? "#222222" : "#ffffff"}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
    </Float>
  );
}

export default function LiquidGlassBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none w-full h-full overflow-hidden transition-opacity duration-1000">
      <Canvas 
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
          dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.3 : 1.5} />
          {/* Simulated Figma 'Light' angle 40 degrees, strength 80% */}
          <directionalLight position={[10, 10, 5]} intensity={isDark ? 0.8 : 2} />
          
          <Environment resolution={256}>
            <group rotation={[-Math.PI / 3, 0, 1]}>
              <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[5, 1, -1]} scale={2} />
              <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
            </group>
          </Environment>

          <AnimatedBlobs />
          <GlassPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}
