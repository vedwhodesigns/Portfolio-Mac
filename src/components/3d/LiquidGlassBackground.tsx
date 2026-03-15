"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, useTexture, RoundedBox, Cylinder } from "@react-three/drei";
import React, { Suspense, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

function DayNightImageBackground() {
  const { theme } = useTheme();
  
  // High quality Unsplash nature landscapes for Day & Night
  const dayTexture = useTexture("https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2560");
  const nightTexture = useTexture("https://images.unsplash.com/photo-1532767153582-b1a0e5145009?q=80&w=2560");
  
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;

  const dayMat = useRef<THREE.MeshBasicMaterial>(null);
  const nightMat = useRef<THREE.MeshBasicMaterial>(null);

  // Smooth crossfade animation on theme toggle
  useFrame((_, delta) => {
     if (nightMat.current && dayMat.current) {
         const targetNight = theme === 'dark' ? 1 : 0;
         const targetDay = theme === 'dark' ? 0 : 1;
         nightMat.current.opacity = THREE.MathUtils.lerp(nightMat.current.opacity, targetNight, delta * 3);
         dayMat.current.opacity = THREE.MathUtils.lerp(dayMat.current.opacity, targetDay, delta * 3);
     }
  });

  const { viewport } = useThree();
  const scale = Math.max(viewport.width, viewport.height) * 1.5;

  return (
     <group position={[0, 0, -10]}>
         <mesh scale={[scale, scale, 1]}>
             <planeGeometry />
             <meshBasicMaterial ref={nightMat} map={nightTexture} transparent opacity={1} />
         </mesh>
         <mesh scale={[scale, scale, 1]}>
             <planeGeometry />
             <meshBasicMaterial ref={dayMat} map={dayTexture} transparent opacity={0} />
         </mesh>
     </group>
  );
}

function LiquidGlassShapes() {
    const { viewport, size } = useThree();
    const px = (p: number) => (p / size.width) * viewport.width;
    
    // Viewer Controls Nav Bar Pill dimensions & position
    const navW = px(380);
    const navH = px(62);
    const navRight = px(24);
    const navBottom = px(24);
    
    // Theme Toggle Pill dimensions & position
    const toggleW = px(58);
    const toggleH = px(58);
    const toggleRight = px(24);
    const toggleTop = px(24);
 
    const navX = (viewport.width / 2) - navRight - (navW / 2);
    const navY = (-viewport.height / 2) + navBottom + (navH / 2);

    const toggleX = (viewport.width / 2) - toggleRight - (toggleW / 2);
    const toggleY = (viewport.height / 2) - toggleTop - (toggleH / 2);

    // Explicit Glass Properties requested by User
    const glassProps = {
        color: "#2B2B2B",          // Hex: 2B2B2B Fill
        transparent: true,
        opacity: 0.8,              // Inverse of 20% opacity for transmission blending
        transmission: 1.0,         // Base Refraction Active
        ior: 1.81,                 // Refraction: 81
        thickness: 4.5,            // Depth: 45
        chromaticAberration: 0.37, // Dispersion: 37
        roughness: 0.02,           // Frost: 2
        anisotropy: 0.42,          // Splay: 42
        resolution: 1024,
        samples: 16
    };
 
    return (
        <group>
            {/* Viewer Controls Pill */}
            <RoundedBox args={[navW, navH, px(45)]} radius={navH/2} position={[navX, navY, 0]}>
                <MeshTransmissionMaterial {...glassProps} />
            </RoundedBox>

            {/* Theme Toggle Pill */}
            <Cylinder args={[toggleW/2, toggleW/2, px(45), 32]} rotation={[Math.PI/2, 0, 0]} position={[toggleX, toggleY, 0]}>
                <MeshTransmissionMaterial {...glassProps} />
            </Cylinder>
        </group>
    )
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
          {/* Simulated Figma 'Light' angle 30 degrees, 100% */}
          <directionalLight position={[10, 10, 5]} intensity={isDark ? 1 : 2} />
          
          <DayNightImageBackground />
          <LiquidGlassShapes />
        </Suspense>
      </Canvas>
    </div>
  );
}
