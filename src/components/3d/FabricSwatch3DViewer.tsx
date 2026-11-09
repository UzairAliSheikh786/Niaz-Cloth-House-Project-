import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Rotate3d, 
  Sun, 
  Layers, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause,
  Info
} from 'lucide-react';
import { createFabricWeaveTexture, detectSoftwareGl } from './threeUtils';

interface FabricSwatch3DViewerProps {
  colorHex?: string;
  fabricName?: string;
  craftType?: string;
  isInteractive?: boolean;
  className?: string;
  height?: string;
}

// 3D Procedural Folded Fabric Swatch Mesh
const FoldedFabricModel: React.FC<{
  colorHex: string;
  isWireframe: boolean;
  isAutoRotate: boolean;
  fabricName: string;
}> = ({ colorHex, isWireframe, isAutoRotate, fabricName }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Compute fabric material properties based on fabric type
  const { roughness, metalness, clearcoat, normalScale } = useMemo(() => {
    const lower = fabricName.toLowerCase();
    if (lower.includes('boski') || lower.includes('silk')) {
      return { roughness: 0.18, metalness: 0.35, clearcoat: 0.8, normalScale: 0.2 };
    }
    if (lower.includes('khaddar') || lower.includes('cotton')) {
      return { roughness: 0.75, metalness: 0.05, clearcoat: 0.05, normalScale: 0.6 };
    }
    if (lower.includes('organza') || lower.includes('embroid')) {
      return { roughness: 0.3, metalness: 0.45, clearcoat: 0.6, normalScale: 0.4 };
    }
    // Default wash & wear / lawn
    return { roughness: 0.35, metalness: 0.15, clearcoat: 0.35, normalScale: 0.3 };
  }, [fabricName]);

  // Procedural 3D S-Curve Fold Geometry
  const swatchGeometry = useMemo(() => {
    // Generate an elegant cascading S-curve representing folded unstitched fabric
    const foldPoints = [
      new THREE.Vector3(-1.6, 1.1, -0.4),
      new THREE.Vector3(-1.1, 0.7, 0.45),
      new THREE.Vector3(-0.4, 0.1, -0.35),
      new THREE.Vector3(0.3, -0.4, 0.5),
      new THREE.Vector3(1.0, -0.9, -0.2),
      new THREE.Vector3(1.6, -1.2, 0.3),
    ];
    const path = new THREE.CatmullRomCurve3(foldPoints);

    // Cross-section profile of the fabric swatch (wide ribbon with slight thickness)
    const shape = new THREE.Shape();
    const width = 1.35;
    const thickness = 0.025;
    shape.moveTo(-width / 2, -thickness / 2);
    shape.lineTo(width / 2, -thickness / 2);
    shape.lineTo(width / 2, thickness / 2);
    shape.lineTo(-width / 2, thickness / 2);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      extrudePath: path,
      steps: 48,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    geometry.center();
    return geometry;
  }, []);

  // Procedural micro-weave texture
  const weaveTexture = useMemo(() => createFabricWeaveTexture(), []);

  // Soft subtle breathing animation
  useFrame((state, delta) => {
    if (groupRef.current && isAutoRotate) {
      groupRef.current.rotation.y += delta * 0.45;
    }
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 1.4) * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        geometry={swatchGeometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={colorHex}
          roughness={roughness}
          metalness={metalness}
          normalMap={weaveTexture}
          normalScale={new THREE.Vector2(normalScale, normalScale)}
          wireframe={isWireframe}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Decorative Gold Embossed Atelier Tag on the fold edge */}
      <mesh position={[0.7, -0.65, 0.35]} rotation={[0.2, -0.4, 0.1]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.88} roughness={0.15} />
      </mesh>
    </group>
  );
};

export const FabricSwatch3DViewer: React.FC<FabricSwatch3DViewerProps> = ({
  colorHex = '#D4AF37',
  fabricName = 'Royal Boski Silk',
  craftType = 'Luxury Unstitched',
  isInteractive = true,
  className = '',
  height = 'h-[380px] sm:h-[450px]',
}) => {
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);
  const [lightPreset, setLightPreset] = useState<'studio' | 'daylight' | 'golden'>('studio');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const isSoftwareGl = useMemo(() => detectSoftwareGl(), []);

  return (
    <div
      className={`relative w-full ${height} bg-gradient-to-b from-[#181818] via-[#121212] to-[#0A0A0A] rounded-xl overflow-hidden border border-neutral-800 shadow-2xl select-none flex flex-col justify-between ${
        isFullscreen ? 'fixed inset-4 z-50 h-auto max-h-[96vh]' : ''
      } ${className}`}
    >
      {/* Top Header Overlay HUD */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-black/75 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-full flex items-center gap-1.5 shadow-md">
            <Rotate3d className="w-3.5 h-3.5" />
            <span>3D Fabric Fold Inspector</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] text-neutral-300 font-sans">
            <span
              className="w-2 h-2 rounded-full border border-white/20"
              style={{ backgroundColor: colorHex }}
            />
            <span>{fabricName}</span>
          </span>
        </div>

        {/* Viewport Control Buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setIsAutoRotate((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-all ${
              isAutoRotate ? 'bg-white/20 text-white border-white/40' : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white'
            }`}
            title={isAutoRotate ? 'Pause Rotation' : 'Auto Rotate'}
            aria-label="Toggle Turntable Rotation"
          >
            {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsWireframe((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-all ${
              isWireframe ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white'
            }`}
            title="Inspect Loom Weave Structure"
            aria-label="Toggle Wireframe Weave"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-full bg-black/60 text-neutral-400 border border-white/10 hover:text-white transition-all"
            title={isFullscreen ? 'Exit Full View' : 'Full Screen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* R3F Canvas Mount */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas
          shadows={!isSoftwareGl}
          camera={{ position: [0, 0.4, 4.4], fov: 42 }}
          dpr={isSoftwareGl ? 1 : [1, 2]}
          gl={{
            antialias: !isSoftwareGl,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.15,
          }}
        >
          <Suspense fallback={null}>
            {/* Ambient & Directional Lighting Rig */}
            <ambientLight intensity={lightPreset === 'daylight' ? 0.9 : 0.6} />

            {lightPreset === 'studio' && (
              <>
                <directionalLight position={[4, 5, 4]} intensity={2.6} castShadow={!isSoftwareGl} color="#FFF5EA" />
                <directionalLight position={[-4, -2, 3]} intensity={1.1} color="#C4D8EE" />
                <directionalLight position={[0, 5, -3]} intensity={1.8} color="#D4AF37" />
              </>
            )}

            {lightPreset === 'daylight' && (
              <>
                <directionalLight position={[2, 6, 4]} intensity={3.2} castShadow={!isSoftwareGl} color="#FFFFFF" />
                <directionalLight position={[-3, 2, 2]} intensity={1.4} color="#E0EDFF" />
              </>
            )}

            {lightPreset === 'golden' && (
              <>
                <directionalLight position={[3, 4, 3]} intensity={2.8} castShadow={!isSoftwareGl} color="#F5BA42" />
                <directionalLight position={[-3, -1, 2]} intensity={0.9} color="#FF7733" />
                <directionalLight position={[0, 4, -4]} intensity={2.2} color="#D4AF37" />
              </>
            )}

            {/* Folded Fabric Model inside a gentle float container */}
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
              <FoldedFabricModel
                colorHex={colorHex}
                isWireframe={isWireframe}
                isAutoRotate={isAutoRotate}
                fabricName={fabricName}
              />
            </Float>

            {/* Soft Contact Ground Shadow */}
            {!isSoftwareGl && (
              <ContactShadows
                position={[0, -1.5, 0]}
                opacity={0.55}
                scale={6}
                blur={2.4}
                far={3}
              />
            )}

            {/* Interactive Orbit Controls with smooth damping */}
            {isInteractive && (
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2.6}
                maxDistance={6.5}
                dampingFactor={0.06}
                rotateSpeed={0.8}
              />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Ergonomic Bottom Control Dock (Three.js Skill Standard) */}
      <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between gap-2 p-2.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white">
        
        {/* Lighting Selector */}
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span className="text-[10px] uppercase font-bold text-neutral-400 hidden sm:inline">Light:</span>
          <button
            onClick={() => setLightPreset('studio')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              lightPreset === 'studio' ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => setLightPreset('daylight')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              lightPreset === 'daylight' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Daylight
          </button>
          <button
            onClick={() => setLightPreset('golden')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
              lightPreset === 'golden' ? 'bg-amber-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Golden
          </button>
        </div>

        {/* Tactile Tip / Instruction */}
        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-sans">
          <Info className="w-3 h-3 text-[#D4AF37]" />
          <span className="hidden sm:inline">Drag to rotate 360° · Scroll to inspect weave</span>
          <span className="sm:hidden">Drag to inspect in 3D</span>
        </div>

      </div>

    </div>
  );
};
