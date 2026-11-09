import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, Layers, Compass, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { detectSoftwareGl, prefersReducedMotion, disposeThreeHierarchy, createFabricWeaveTexture } from './threeUtils';

export interface FabricPreset {
  id: string;
  name: string;
  color: number;
  sheenColor: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
  waveSpeed: number;
  waveAmp: number;
  description: string;
}

export const FABRIC_PRESETS: FabricPreset[] = [
  {
    id: 'boski',
    name: 'Royal Chinese Boski',
    color: 0xFDFBF7, // Ivory Gold Sheen
    sheenColor: 0xD4AF37,
    metalness: 0.25,
    roughness: 0.18,
    clearcoat: 0.85,
    waveSpeed: 1.1,
    waveAmp: 0.65,
    description: '100% Pure Spun Silk · Liquid Gold Draping',
  },
  {
    id: 'embroidered',
    name: 'Festive Zari Organza',
    color: 0x0A2F1D, // Emerald with gold
    sheenColor: 0xF3C623,
    metalness: 0.45,
    roughness: 0.32,
    clearcoat: 0.7,
    waveSpeed: 0.85,
    waveAmp: 0.5,
    description: 'Gold Thread Embroidery · Crisp Stiff Silhouette',
  },
  {
    id: 'lawn',
    name: 'Festive Crimson Lawn',
    color: 0x8B1E28, // Deep Ruby Crimson
    sheenColor: 0xE87A82,
    metalness: 0.15,
    roughness: 0.45,
    clearcoat: 0.3,
    waveSpeed: 1.35,
    waveAmp: 0.8,
    description: 'Super Combed 90/88 Lawn · Featherweight Flow',
  },
  {
    id: 'khaddar',
    name: 'Kamalia Textured Khaddar',
    color: 0x3E2D22, // Rich Earth Bark
    sheenColor: 0x9B7B61,
    metalness: 0.05,
    roughness: 0.75,
    clearcoat: 0.1,
    waveSpeed: 0.6,
    waveAmp: 0.4,
    description: 'Traditional Hand-Spun Yarn · Heavy Winter Drape',
  },
];

interface SilkWeaveHeroCanvasProps {
  onExploreCatalog?: () => void;
}

export const SilkWeaveHeroCanvas: React.FC<SilkWeaveHeroCanvasProps> = ({ onExploreCatalog }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('boski');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // References to communicate with Three.js loop without re-triggering useEffect
  const currentPresetRef = useRef<FabricPreset>(FABRIC_PRESETS[0]);
  const isWireframeRef = useRef<boolean>(false);

  useEffect(() => {
    const found = FABRIC_PRESETS.find((p) => p.id === selectedPresetId);
    if (found) currentPresetRef.current = found;
  }, [selectedPresetId]);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
  }, [isWireframe]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const isReducedMotion = prefersReducedMotion();

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, -1.8, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig (3-Point Lighting)
    // Key Light (Warm Gold Directional)
    const keyLight = new THREE.DirectionalLight(0xFFE8D6, 2.5);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    // Fill Light (Cool Soft Slate)
    const fillLight = new THREE.DirectionalLight(0x90A4AE, 1.2);
    fillLight.position.set(-6, -3, 4);
    scene.add(fillLight);

    // Rim Light (Sharp Gold Edge)
    const rimLight = new THREE.DirectionalLight(0xD4AF37, 2.0);
    rimLight.position.set(0, 8, -4);
    scene.add(rimLight);

    // Ambient Studio Soft Fill
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x111111, 0.8);
    scene.add(ambientLight);

    // 3. Parametric Undulating Fabric Mesh (Cloth Geometry)
    const segmentsX = isSoftwareGl ? 32 : 56;
    const segmentsY = isSoftwareGl ? 24 : 42;
    const planeWidth = 14;
    const planeHeight = 9;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    // Keep original unperturbed vertex positions for wave computation
    const originalPositions = (geometry.attributes.position.array as Float32Array).slice();

    const weaveTexture = createFabricWeaveTexture();

    const material = new THREE.MeshStandardMaterial({
      color: currentPresetRef.current.color,
      roughness: currentPresetRef.current.roughness,
      metalness: currentPresetRef.current.metalness,
      normalMap: weaveTexture,
      normalScale: new THREE.Vector2(0.35, 0.35),
      side: THREE.DoubleSide,
      wireframe: isWireframeRef.current,
    });

    const fabricMesh = new THREE.Mesh(geometry, material);
    fabricMesh.rotation.x = -Math.PI * 0.12;
    fabricMesh.rotation.z = Math.PI * 0.04;
    scene.add(fabricMesh);

    // 4. Subtle Gold Weaver Accent Spindles (Secondary Procedural 3D Props)
    const spindleGroup = new THREE.Group();
    const spindleGeo = new THREE.CylinderGeometry(0.06, 0.06, 7.5, 16);
    const spindleMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.15,
    });

    const spindleTop = new THREE.Mesh(spindleGeo, spindleMat);
    spindleTop.position.set(0, 3.8, -0.5);
    spindleTop.rotation.z = Math.PI * 0.5;
    spindleGroup.add(spindleTop);

    const spindleBottom = new THREE.Mesh(spindleGeo, spindleMat);
    spindleBottom.position.set(0, -3.8, 0.5);
    spindleBottom.rotation.z = Math.PI * 0.5;
    spindleGroup.add(spindleBottom);

    scene.add(spindleGroup);

    // 5. Mouse & Touch Interactive Ripple Physics
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let isPointerInteracting = false;
    let interactionEnergy = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetMouseX = x;
      targetMouseY = y;
      interactionEnergy = Math.min(interactionEnergy + 0.15, 1.5);
    };

    const handlePointerDown = () => {
      isPointerInteracting = true;
      interactionEnergy = 1.8;
    };

    const handlePointerUp = () => {
      isPointerInteracting = false;
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });
    container.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });

    // 6. Intersection Observer for Auto-Pause
    let isInViewport = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isInViewport = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // 7. Render Loop with High-Fidelity Wave Displacements
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isInViewport) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth preset transitions
      const targetPreset = currentPresetRef.current;
      material.color.lerp(new THREE.Color(targetPreset.color), delta * 3);
      material.roughness = THREE.MathUtils.damp(material.roughness, targetPreset.roughness, 3, delta);
      material.metalness = THREE.MathUtils.damp(material.metalness, targetPreset.metalness, 3, delta);
      material.wireframe = isWireframeRef.current;

      // Mouse damping
      currentMouseX = THREE.MathUtils.damp(currentMouseX, targetMouseX, 3.5, delta);
      currentMouseY = THREE.MathUtils.damp(currentMouseY, targetMouseY, 3.5, delta);
      interactionEnergy = THREE.MathUtils.damp(interactionEnergy, 0.1, 1.2, delta);

      // Camera gentle dynamic tilt
      camera.position.x = currentMouseX * 0.8;
      camera.position.y = -1.8 + currentMouseY * 0.4;
      camera.lookAt(0, 0, 0);

      // Dynamic light movement following cursor
      keyLight.position.x = 5 + currentMouseX * 3;
      keyLight.position.y = 7 + currentMouseY * 3;

      if (!isReducedMotion) {
        // Vertex displacement: Silk wave equation
        const posAttr = geometry.attributes.position;
        const posArray = posAttr.array as Float32Array;
        const count = posAttr.count;
        const speed = targetPreset.waveSpeed;
        const amp = targetPreset.waveAmp;

        for (let i = 0; i < count; i++) {
          const origX = originalPositions[i * 3];
          const origY = originalPositions[i * 3 + 1];

          // Distance from mouse ripple center
          const dx = origX - currentMouseX * (planeWidth * 0.4);
          const dy = origY - currentMouseY * (planeHeight * 0.4);
          const distSq = dx * dx + dy * dy;
          const mouseRipple = Math.sin(Math.sqrt(distSq) * 2.5 - elapsed * 4) * Math.exp(-distSq * 0.18) * interactionEnergy;

          // Natural fabric harmonic oscillations
          const primaryWave = Math.sin(origX * 0.45 + elapsed * speed) * Math.cos(origY * 0.35 + elapsed * (speed * 0.8)) * amp;
          const secondaryWave = Math.sin(origX * 0.9 - elapsed * (speed * 1.2) + origY * 0.6) * (amp * 0.35);

          posArray[i * 3 + 2] = primaryWave + secondaryWave + mouseRipple;
        }

        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // 8. Responsive Resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 800;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);

      disposeThreeHierarchy(scene);
      geometry.dispose();
      material.dispose();
      weaveTexture.dispose();
      spindleGeo.dispose();
      spindleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] sm:h-[620px] lg:h-[680px] bg-gradient-to-b from-[#0D0D0D] via-[#141414] to-[#0A0A0A] overflow-hidden select-none">
      
      {/* 3D WebGL Canvas Mount */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-0" 
      />

      {/* Luxury Ambient Lighting Glow Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-950/20 rounded-full blur-[90px] pointer-events-none" />

      {/* Semantic Headline & Brand Content (Top Left Anchor) */}
      <div className="absolute top-8 left-6 sm:left-12 z-10 max-w-xl pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] sm:text-xs font-sans tracking-[0.25em] uppercase font-bold mb-3 shadow-lg">
          <Compass className="w-3.5 h-3.5" />
          <span>Interactive 3D Textile Atelier</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.08] drop-shadow-md">
          Tactile Silk & <br />
          <span className="italic font-light text-[#D4AF37]">Woven Motion</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-300 font-sans font-light mt-2.5 max-w-md leading-relaxed drop-shadow-sm">
          Drag to ripple the pure unstitched drape. Experience authentic Pakistani mill fiber density, gold thread sheen, and selvedge kinematics in real-time 3D.
        </p>
      </div>

      {/* Top-Right Direct Catalog Link */}
      {onExploreCatalog && (
        <div className="absolute top-8 right-6 sm:right-12 z-10">
          <button
            onClick={onExploreCatalog}
            className="pointer-events-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-white/10 hover:bg-white text-white hover:text-black border border-white/30 text-[10px] sm:text-xs font-sans font-bold tracking-[0.2em] uppercase transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>Enter Boutique</span>
          </button>
        </div>
      )}

      {/* Unified Bottom Control Dock (Three.js Skill Ergonomic Standard: Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl pointer-events-auto transition-transform duration-300 ease-out">
        
        {/* Collapsible Toggle Handle */}
        <div className="flex justify-center -mb-px">
          <button
            onClick={() => setIsDockCollapsed((prev) => !prev)}
            className="px-4 py-1 bg-[#1A1A1A]/90 hover:bg-[#252525] text-neutral-300 text-[10px] font-sans font-bold tracking-widest uppercase border border-b-0 border-white/15 rounded-t-md shadow-md flex items-center gap-1.5 transition-colors"
          >
            {isDockCollapsed ? (
              <>
                <ChevronUp className="w-3 h-3 text-[#D4AF37]" />
                <span>Show Fabric Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        {/* Control Dock Panel */}
        {!isDockCollapsed && (
          <div className="bg-[#141414]/90 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
            
            {/* Fabric Swatch Selectors */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
              {FABRIC_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 border ${
                    selectedPresetId === preset.id
                      ? 'bg-white text-black border-white shadow-md font-bold'
                      : 'bg-white/5 text-neutral-300 border-white/10 hover:border-white/30 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: `#${preset.color.toString(16).padStart(6, '0')}` }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>

            {/* Utility Toggles: Wireframe & Reset */}
            <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-white/15 pt-2 sm:pt-0 sm:pl-3">
              <button
                onClick={() => setIsWireframe((prev) => !prev)}
                className={`p-2 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
                  isWireframe
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-bold'
                    : 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10'
                }`}
                title="Toggle 3D Loom Weave Matrix"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-wider">3D Mesh</span>
              </button>

              <div className="text-[11px] text-neutral-400 font-sans hidden lg:block tracking-wide">
                <span>{currentPresetRef.current.description}</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
