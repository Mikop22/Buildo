/**
 * ModelViewer Component
 * 
 * Polished 3D GLB viewer using React Three Fiber.
 * Features:
 * - Orbit controls (rotate, zoom, pan)
 * - Soft lighting + environment lighting
 * - Auto-center model
 * - Auto-rotate toggle
 * - Reset camera button
 */

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface ModelViewerProps {
  modelUrl: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  className?: string;
}

// Loading fallback component
function LoadingSpinner() {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#666",
      fontSize: "14px",
    }}>
      Loading 3D model...
    </div>
  );
}

// 3D Model component
function Model({ 
  url, 
  dimensions,
  autoRotate 
}: { 
  url: string; 
  dimensions?: ModelViewerProps["dimensions"];
  autoRotate: boolean;
}) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  // Auto-rotate animation
  useFrame((state, delta) => {
    if (autoRotate && modelRef.current) {
      modelRef.current.rotation.y += delta * 0.5;
    }
  });

  // Center and scale model
  useEffect(() => {
    if (scene && modelRef.current) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center the model
      scene.position.sub(center);

      // Scale if dimensions provided
      if (dimensions) {
        const maxDimension = Math.max(
          dimensions.width || 1,
          dimensions.height || 1,
          dimensions.depth || 1
        );
        const maxSize = Math.max(size.x, size.y, size.z);
        const scale = maxDimension / maxSize;
        scene.scale.set(scale, scale, scale);
      } else {
        // Auto-scale to fit in view
        const maxSize = Math.max(size.x, size.y, size.z);
        const targetSize = 2; // Target size in 3D units
        const scale = targetSize / maxSize;
        scene.scale.set(scale, scale, scale);
      }
    }
  }, [scene, dimensions]);

  return (
    <group ref={modelRef}>
      <primitive object={scene} />
    </group>
  );
}

// Three.js Controls component (only Three.js objects, no HTML)
function SceneControls({ 
  autoRotate,
  controlsRef
}: { 
  autoRotate: boolean;
  controlsRef: React.MutableRefObject<any>;
}) {
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={1}
      maxDistance={10}
      autoRotate={autoRotate}
      autoRotateSpeed={1}
    />
  );
}

// Main viewer component
export function ModelViewer({ modelUrl, dimensions, className }: ModelViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const controlsRef = useRef<any>(null);

  const handleReset = () => {
    if (controlsRef.current) {
      // Reset camera position and rotation
      const controls = controlsRef.current;
      controls.object.position.set(0, 0, 5);
      controls.object.rotation.set(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    }
    setResetKey((prev) => prev + 1);
  };

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {/* UI Buttons - Outside Canvas (HTML elements) */}
      <div style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        zIndex: 10,
        pointerEvents: "auto",
      }}>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          style={{
            padding: "8px 12px",
            backgroundColor: autoRotate ? "#4CAF50" : "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          {autoRotate ? "⏸ Pause" : "▶ Rotate"}
        </button>
        <button
          onClick={handleReset}
          style={{
            padding: "8px 12px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "500",
          }}
        >
          🔄 Reset Camera
        </button>
      </div>

      {/* 3D Canvas - Only Three.js objects */}
      <Suspense fallback={<LoadingSpinner />}>
        <Canvas
          key={resetKey}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          
          {/* Soft lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.4} />
          
          {/* Environment lighting for better material rendering */}
          <Environment preset="sunset" />
          
          {/* Model */}
          <Model url={modelUrl} dimensions={dimensions} autoRotate={autoRotate} />
          
          {/* Three.js Controls Only */}
          <SceneControls
            autoRotate={autoRotate}
            controlsRef={controlsRef}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Preload GLB for better UX
export function preloadModel(url: string) {
  useGLTF.preload(url);
}
