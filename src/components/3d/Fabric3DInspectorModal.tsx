import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  X, 
  Rotate3d, 
  Sun, 
  ZoomIn, 
  ShoppingBag, 
  MessageCircle, 
  ShieldCheck, 
  Sparkles,
  Maximize2,
  Wind,
  Layers
} from 'lucide-react';
import { Product } from '../../types';
import { useShop, formatPKR } from '../../context/ShopContext';
import { 
  detectSoftwareGl, 
  prefersReducedMotion, 
  disposeThreeHierarchy, 
  createContactShadowTexture,
  createFabricWeaveTexture 
} from './threeUtils';

interface Fabric3DInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const Fabric3DInspectorModal: React.FC<Fabric3DInspectorModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { addToCart, showToast } = useShop();

  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(5.5);
  const [lightPreset, setLightPreset] = useState<'daylight' | 'studio' | 'evening'>('studio');
  const [isWireframe, setIsWireframe] = useState<boolean>(false);

  // Ref tracking for Three.js animation loop without resetting canvas
  const lightPresetRef = useRef<'daylight' | 'studio' | 'evening'>('studio');
  const zoomLevelRef = useRef<number>(5.5);
  const isWireframeRef = useRef<boolean>(false);
  const flutterImpulseRef = useRef<number>(0);

  useEffect(() => {
    lightPresetRef.current = lightPreset;
  }, [lightPreset]);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

  useEffect(() => {
    isWireframeRef.current = isWireframe;
  }, [isWireframe]);

  const triggerFlutter = () => {
    flutterImpulseRef.current = Math.min(flutterImpulseRef.current + 2.2, 4.0);
  };

  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    const isReducedMotion = prefersReducedMotion();

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Multi-Point Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xFFF2E0, 2.8);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xCCE0FF, 1.2);
    fillLight.position.set(-4, -1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xD4AF37, 2.2);
    rimLight.position.set(0, 6, -3);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
    scene.add(hemiLight);

    // 3. Composite Procedural 3D Fabric Bolt Model (THREE.Group with 5 parts)
    const boltGroup = new THREE.Group();
    scene.add(boltGroup);

    // Color extraction from product
    let fabricColorHex = 0xD4AF37; // default royal gold
    if (product?.colorHex && product.colorHex.startsWith('#')) {
      try {
        fabricColorHex = parseInt(product.colorHex.replace('#', '0x'), 16);
      } catch {
        fabricColorHex = 0xD4AF37;
      }
    }

    const weaveTexture = createFabricWeaveTexture();

    // Part 1: Rolled Fabric Bolt Cylinder (Main Body)
    const cylinderGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.6, isSoftwareGl ? 24 : 48);
    const fabricMaterial = new THREE.MeshStandardMaterial({
      color: fabricColorHex,
      roughness: 0.35,
      metalness: 0.25,
      normalMap: weaveTexture,
      normalScale: new THREE.Vector2(0.3, 0.3),
      side: THREE.DoubleSide,
    });
    const boltCylinder = new THREE.Mesh(cylinderGeo, fabricMaterial);
    boltCylinder.castShadow = !isSoftwareGl;
    boltCylinder.position.set(0, 0.6, 0);
    boltCylinder.rotation.z = Math.PI * 0.5;
    boltGroup.add(boltCylinder);

    // Part 2: Inner Wooden Spindle Core
    const coreGeo = new THREE.CylinderGeometry(0.2, 0.2, 3.1, 16);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x5C4033, // Rich Mahogany
      roughness: 0.7,
      metalness: 0.1,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.z = Math.PI * 0.5;
    coreMesh.position.set(0, 0.6, 0);
    boltGroup.add(coreMesh);

    // Part 3: Gilded Core End Caps (Brass Ferrules)
    const ferruleGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.15, 16);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      metalness: 0.9,
      roughness: 0.2,
    });
    const ferruleLeft = new THREE.Mesh(ferruleGeo, brassMat);
    ferruleLeft.rotation.z = Math.PI * 0.5;
    ferruleLeft.position.set(-1.5, 0.6, 0);
    boltGroup.add(ferruleLeft);

    const ferruleRight = new THREE.Mesh(ferruleGeo, brassMat);
    ferruleRight.rotation.z = Math.PI * 0.5;
    ferruleRight.position.set(1.5, 0.6, 0);
    boltGroup.add(ferruleRight);

    // Part 4: High-Resolution Parametric Cloth Drape Tail with Spring Simulation Physics
    const clothWidth = 2.4;
    const clothHeight = 2.6;
    const cols = isSoftwareGl ? 16 : 28;
    const rows = isSoftwareGl ? 20 : 36;
    const totalVertices = (cols + 1) * (rows + 1);

    const clothGeo = new THREE.PlaneGeometry(clothWidth, clothHeight, cols, rows);

    // Compute rest positions for natural cascading S-curve hanging from the bolt
    const restPositions = new Float32Array(totalVertices * 3);
    const clothPositions = new Float32Array(totalVertices * 3);
    const clothVelocities = new Float32Array(totalVertices * 3);
    const massWeights = new Float32Array(totalVertices);

    let vIdx = 0;
    for (let j = 0; j <= rows; j++) {
      const v = j / rows; // 0 at top pinned edge, 1 at bottom hem
      // Weight increases toward the bottom hem for natural inertia and drape swing
      const weight = Math.pow(v, 1.4);

      // Cascading S-curve profile
      const yRest = 0.6 - v * 2.3;
      const zRest = 0.85 + Math.sin(v * Math.PI * 0.68) * 0.52 + v * 0.55;

      for (let i = 0; i <= cols; i++) {
        const u = i / cols - 0.5; // -0.5 to 0.5
        const xRest = u * clothWidth;
        // Subtle natural vertical fabric ripple folds
        const foldGather = Math.sin(u * Math.PI * 4) * 0.04 * (1 - v * 0.5);

        const idx3 = vIdx * 3;
        restPositions[idx3] = xRest;
        restPositions[idx3 + 1] = yRest;
        restPositions[idx3 + 2] = zRest + foldGather;

        clothPositions[idx3] = restPositions[idx3];
        clothPositions[idx3 + 1] = restPositions[idx3 + 1];
        clothPositions[idx3 + 2] = restPositions[idx3 + 2];

        clothVelocities[idx3] = 0;
        clothVelocities[idx3 + 1] = 0;
        clothVelocities[idx3 + 2] = 0;

        massWeights[vIdx] = weight;
        vIdx++;
      }
    }

    clothGeo.setAttribute('position', new THREE.BufferAttribute(clothPositions, 3));
    clothGeo.computeVertexNormals();

    const drapeMesh = new THREE.Mesh(clothGeo, fabricMaterial);
    drapeMesh.castShadow = !isSoftwareGl;
    drapeMesh.receiveShadow = !isSoftwareGl;
    boltGroup.add(drapeMesh);

    // Part 5: Embossed Brass Niaz 1977 Seal Medallion
    const sealGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 32);
    const sealMesh = new THREE.Mesh(sealGeo, brassMat);
    sealMesh.rotation.x = Math.PI * 0.5;
    sealMesh.position.set(0, 0.6, 0.88);
    boltGroup.add(sealMesh);

    // Part 6: Contact Shadow Grounding Plane
    const shadowGeo = new THREE.PlaneGeometry(5, 5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI * 0.5;
    shadowMesh.position.set(0, -1.72, 0.8);
    scene.add(shadowMesh);

    // 4. Interactive Drag-to-Rotate
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let targetRotationY = 0.4;
    let targetRotationX = 0.1;
    let currentRotationY = 0.4;
    let currentRotationX = 0.1;
    let prevRotationY = 0.4;
    let prevRotationX = 0.1;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;

      targetRotationY += deltaX * 0.01;
      targetRotationX = Math.max(-0.4, Math.min(0.4, targetRotationX + deltaY * 0.01));
      setRotationAngle(Math.round(((targetRotationY % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI)));
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        // pointer may have been released
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);

    // 5. Render Loop with Cloth Simulation Physics & Damping
    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Camera distance zoom interpolation
      camera.position.z = THREE.MathUtils.damp(camera.position.z, zoomLevelRef.current, 5, delta);

      // Light Preset adjustments
      if (lightPresetRef.current === 'daylight') {
        keyLight.color.setHex(0xFFFFFF);
        keyLight.intensity = 3.2;
        hemiLight.intensity = 0.8;
      } else if (lightPresetRef.current === 'evening') {
        keyLight.color.setHex(0xFFAA55);
        keyLight.intensity = 2.2;
        rimLight.color.setHex(0xFF7733);
      } else {
        keyLight.color.setHex(0xFFF2E0);
        keyLight.intensity = 2.8;
        rimLight.color.setHex(0xD4AF37);
      }

      fabricMaterial.wireframe = isWireframeRef.current;

      // Smooth rotation damping
      if (!isDragging && !isReducedMotion) {
        targetRotationY += 0.003; // Gentle auto-turntable spin
      }

      currentRotationY = THREE.MathUtils.damp(currentRotationY, targetRotationY, 4, delta);
      currentRotationX = THREE.MathUtils.damp(currentRotationX, targetRotationX, 4, delta);

      boltGroup.rotation.y = currentRotationY;
      boltGroup.rotation.x = currentRotationX;

      // Calculate angular velocities to drive cloth simulation physics
      const angularVelY = (currentRotationY - prevRotationY) / Math.max(delta, 0.001);
      const angularVelX = (currentRotationX - prevRotationX) / Math.max(delta, 0.001);
      prevRotationY = currentRotationY;
      prevRotationX = currentRotationX;

      // Impulse decay for manual flutter
      flutterImpulseRef.current = THREE.MathUtils.damp(flutterImpulseRef.current, 0, 1.8, delta);

      // --- Cloth Physics Simulation Update (Mass-Spring-Damper Integration) ---
      if (!isReducedMotion) {
        const posAttr = clothGeo.attributes.position;
        const posArr = posAttr.array as Float32Array;

        const springK = 38.0;
        const damping = 5.2;
        const flutterStrength = flutterImpulseRef.current;
        const totalRotSpeed = Math.abs(angularVelY) + Math.abs(angularVelX);

        for (let idx = 0; idx < totalVertices; idx++) {
          const idx3 = idx * 3;
          const weight = massWeights[idx];

          if (weight === 0) {
            // Anchor row is attached to the cylinder roll
            posArr[idx3] = restPositions[idx3];
            posArr[idx3 + 1] = restPositions[idx3 + 1];
            posArr[idx3 + 2] = restPositions[idx3 + 2];
            continue;
          }

          // Inertial momentum opposing rotation direction
          const inertiaX = -angularVelY * weight * 0.16;
          // Centrifugal lift flaring the draped tail outward
          const centrifugalZ = Math.min(Math.abs(angularVelY) * 0.08, 0.4) * weight;

          // Propagating ripple flutter waves
          const waveFreq = 4.2;
          const rippleX = Math.sin(idx * 0.25 + elapsed * waveFreq) * (totalRotSpeed * 0.025 + flutterStrength * 0.08) * weight;
          const rippleZ = Math.cos(idx * 0.35 + elapsed * (waveFreq * 1.2)) * (totalRotSpeed * 0.035 + flutterStrength * 0.12) * weight;
          const rippleY = Math.sin(idx * 0.2 + elapsed * (waveFreq * 0.8)) * (totalRotSpeed * 0.015 + flutterStrength * 0.04) * weight;

          // Target equilibrium position for this frame
          const targetX = restPositions[idx3] + inertiaX + rippleX;
          const targetY = restPositions[idx3 + 1] + rippleY;
          const targetZ = restPositions[idx3 + 2] + centrifugalZ + rippleZ;

          // Spring acceleration = -k * (x - x_target) - c * v
          const accelX = (targetX - posArr[idx3]) * springK - clothVelocities[idx3] * damping;
          const accelY = (targetY - posArr[idx3 + 1]) * springK - clothVelocities[idx3 + 1] * damping;
          const accelZ = (targetZ - posArr[idx3 + 2]) * springK - clothVelocities[idx3 + 2] * damping;

          clothVelocities[idx3] += accelX * delta;
          clothVelocities[idx3 + 1] += accelY * delta;
          clothVelocities[idx3 + 2] += accelZ * delta;

          posArr[idx3] += clothVelocities[idx3] * delta;
          posArr[idx3 + 1] += clothVelocities[idx3 + 1] * delta;
          posArr[idx3 + 2] += clothVelocities[idx3 + 2] * delta;
        }

        posAttr.needsUpdate = true;
        clothGeo.computeVertexNormals();
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // 6. Resize handling
    const onResize = () => {
      if (!container) return;
      width = container.clientWidth || 600;
      height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);

      disposeThreeHierarchy(scene);
      cylinderGeo.dispose();
      coreGeo.dispose();
      ferruleGeo.dispose();
      clothGeo.dispose();
      sealGeo.dispose();
      shadowGeo.dispose();
      fabricMaterial.dispose();
      coreMat.dispose();
      brassMat.dispose();
      shadowMat.dispose();
      weaveTexture.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      showToast(`${product.title} added to bag from 3D Atelier!`);
    }
  };

  const waMessage = encodeURIComponent(
    `Hello Niaz Cloth House! I just inspected *${product?.title || 'Unstitched Fabric'}* in your 3D Atelier.\nPrice: ${product ? formatPKR(product.price) : 'PKR'}\nPlease share live video demonstration from Paris Bazaar.`
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-3d-title"
    >
      <div className="relative w-full max-w-5xl bg-[#141414] border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 bg-black/60 hover:bg-black text-white/80 hover:text-white rounded-full border border-white/20 transition-all focus:outline-none"
          aria-label="Close 3D Inspector"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Viewport Column (Left/Main) */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[560px] bg-[#0E0E0E] flex flex-col justify-between">
          
          {/* Top Viewport HUD Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
            <div className="px-3 py-1 bg-black/60 backdrop-blur-sm border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-sans font-bold tracking-[0.2em] uppercase rounded-full flex items-center gap-1.5 shadow-md">
              <Rotate3d className="w-3.5 h-3.5" />
              <span>360° Bolt Turntable</span>
            </div>

            {/* Cloth Physics Simulation Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[9px] font-sans font-bold uppercase rounded-full shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Cloth Physics Active</span>
            </span>

            <span className="text-[10px] text-white/60 font-mono tracking-wider hidden md:inline">
              {rotationAngle}° AZIMUTH
            </span>
          </div>

          {/* Interactive Top-Right Action: Flutter Cloth & Wireframe Toggle */}
          <div className="absolute top-4 right-14 z-20 flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={triggerFlutter}
              className="px-2.5 py-1 bg-black/60 hover:bg-black text-[#D4AF37] hover:text-white text-[10px] font-sans font-bold uppercase tracking-wider rounded-full border border-white/15 flex items-center gap-1.5 backdrop-blur-sm transition-all active:scale-95 shadow-md"
              title="Send a dynamic impulse ripple through the draped unstitched cloth"
            >
              <Wind className="w-3 h-3" />
              <span>Flutter Cloth</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWireframe((prev) => !prev)}
              className={`p-1.5 rounded-full border transition-all ${
                isWireframe ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-black/60 text-neutral-400 border-white/15 hover:text-white'
              }`}
              title="Toggle Weave Mesh Wireframe"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* WebGL Canvas Container */}
          <div 
            ref={mountRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
            title="Click and drag to rotate the unstitched fabric bolt and observe cloth ripple physics"
          />

          {/* Collapsible/Ergonomic Bottom Dock on 3D Viewport */}
          <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between gap-2 p-2.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl text-xs text-white">
            
            {/* Lighting Swatches */}
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="text-[10px] uppercase font-bold text-neutral-400 mr-1 hidden sm:inline">Light:</span>
              <button
                type="button"
                onClick={() => setLightPreset('studio')}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  lightPreset === 'studio' ? 'bg-[#D4AF37] text-black shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Studio Warm
              </button>
              <button
                type="button"
                onClick={() => setLightPreset('daylight')}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  lightPreset === 'daylight' ? 'bg-white text-black shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Daylight
              </button>
              <button
                type="button"
                onClick={() => setLightPreset('evening')}
                className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold transition-all ${
                  lightPreset === 'evening' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Loom Glow
              </button>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <ZoomIn className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                type="range"
                min="3.8"
                max="7.0"
                step="0.1"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                className="w-20 sm:w-28 accent-[#D4AF37] cursor-pointer"
                title="Camera Distance"
              />
            </div>
          </div>
        </div>

        {/* Product Details & Actions Column (Right) */}
        <div className="w-full lg:w-80 p-6 bg-[#181818] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paris Bazaar 1970 Heritage Quality</span>
            </div>

            <h3 id="modal-3d-title" className="font-serif text-xl sm:text-2xl text-white font-normal leading-snug">
              {product?.title || 'Royal Unstitched Drape'}
            </h3>

            {product && (
              <div className="text-xl font-sans font-bold text-white tabular-nums">
                {formatPKR(product.price)}
              </div>
            )}

            <div className="space-y-2 text-xs text-neutral-300 font-sans border-t border-b border-white/10 py-3">
              <div className="flex justify-between">
                <span className="text-neutral-400">Fabric Composition:</span>
                <span className="font-semibold text-white">{product?.fabric || 'Pure Silk Blend'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Craft Type:</span>
                <span className="font-semibold text-white">{product?.craftType || 'Artisanal Woven'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Standard Cut:</span>
                <span className="font-semibold text-white">{product?.cutDetails?.length || '4.50 Meters'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Cloth Physics:</span>
                <span className="text-emerald-400 font-semibold">Real-Time Spring Drape</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Inspection Seal:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Original
                </span>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Rotate the bolt to observe inertial drape drag and natural fabric ripples across the woven fibers. 100% genuine Pakistani mill unstitched quality.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-6">
            {product && (
              <button
                onClick={handleAddToCart}
                className="w-full py-3 px-4 bg-white hover:bg-neutral-200 text-black text-xs font-sans font-bold tracking-[0.2em] uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
            )}

            <a
              href={`https://wa.me/923346565636?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-sans font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Live Video Verification</span>
            </a>

            <button
              onClick={onClose}
              className="w-full py-2 text-center text-[11px] text-neutral-400 hover:text-white uppercase tracking-wider font-semibold"
            >
              Continue Browsing
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
