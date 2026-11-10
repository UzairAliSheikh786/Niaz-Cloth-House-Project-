import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Sun, Sparkles, Moon, ChevronUp, ChevronDown, Eye, Sliders } from 'lucide-react';
import { detectSoftwareGl, prefersReducedMotion, disposeThreeHierarchy } from './threeUtils';

export type AmbientLightingPreset = 'daylight' | 'studio' | 'evening';

interface PresetConfig {
  id: AmbientLightingPreset;
  name: string;
  subtitle: string;
  colorTemp: string;
  keyColor: number;
  keyIntensity: number;
  fillColor: number;
  fillIntensity: number;
  fogColor: number;
  fogDensity: number;
  particleColor: string;
  ribbonColor: number;
  ribbonOpacity: number;
}

const PRESET_CONFIGS: Record<AmbientLightingPreset, PresetConfig> = {
  daylight: {
    id: 'daylight',
    name: 'Natural Daylight',
    subtitle: '5000K Soft Sun · Ivory Drape',
    colorTemp: '5000K',
    keyColor: 0xF7F4EE,
    keyIntensity: 1.4,
    fillColor: 0xE8E0D2,
    fillIntensity: 1.0,
    fogColor: 0xF7F4EE,
    fogDensity: 0.015,
    particleColor: 'rgba(212, 175, 55, 0.65)',
    ribbonColor: 0xD4AF37,
    ribbonOpacity: 0.25,
  },
  studio: {
    id: 'studio',
    name: 'Atelier Heritage',
    subtitle: '4000K Neutral Studio · Pure Boski Gold',
    colorTemp: '4000K',
    keyColor: 0xD4AF37,
    keyIntensity: 1.5,
    fillColor: 0xE8E0D2,
    fillIntensity: 0.9,
    fogColor: 0xF7F4EE,
    fogDensity: 0.018,
    particleColor: 'rgba(212, 175, 55, 0.7)',
    ribbonColor: 0xD4AF37,
    ribbonOpacity: 0.28,
  },
  evening: {
    id: 'evening',
    name: 'Evening Atelier',
    subtitle: '2800K Warm Ambient · Champagne Lustre',
    colorTemp: '2800K',
    keyColor: 0xEADBB6,
    keyIntensity: 1.6,
    fillColor: 0xD4AF37,
    fillIntensity: 1.0,
    fogColor: 0xF7F4EE,
    fogDensity: 0.02,
    particleColor: 'rgba(212, 175, 55, 0.65)',
    ribbonColor: 0xEADBB6,
    ribbonOpacity: 0.3,
  },
};

export const AtelierAmbient3DBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<AmbientLightingPreset>('studio');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(true);

  // Keep a mutable ref of the active preset configuration for the render loop
  const presetConfigRef = useRef<PresetConfig>(PRESET_CONFIGS['studio']);

  useEffect(() => {
    presetConfigRef.current = PRESET_CONFIGS[activePreset];
  }, [activePreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    if (prefersReducedMotion()) {
      return;
    }

    const isSoftwareGl = detectSoftwareGl();
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const currentFog = new THREE.FogExp2(presetConfigRef.current.fogColor, presetConfigRef.current.fogDensity);
    scene.fog = currentFog;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 18);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 2. Dynamic Lighting Rig for Ambient Atmosphere
    const keyLight = new THREE.DirectionalLight(
      presetConfigRef.current.keyColor,
      presetConfigRef.current.keyIntensity
    );
    keyLight.position.set(6, 8, 8);
    scene.add(keyLight);

    const ambientFillLight = new THREE.HemisphereLight(
      presetConfigRef.current.fillColor,
      0x111111,
      presetConfigRef.current.fillIntensity
    );
    scene.add(ambientFillLight);

    // 3. Procedural Luxury Gold Silk Strands & Ambient Fibers
    const particleCount = isSoftwareGl ? 35 : 85;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      scales[i] = Math.random() * 0.7 + 0.35;

      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom circular soft glow texture
    const discCanvas = document.createElement('canvas');
    discCanvas.width = 64;
    discCanvas.height = 64;
    const discCtx = discCanvas.getContext('2d');
    if (discCtx) {
      const grad = discCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.3, 'rgba(212, 175, 55, 0.45)');
      grad.addColorStop(0.7, 'rgba(180, 140, 40, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      discCtx.fillStyle = grad;
      discCtx.fillRect(0, 0, 64, 64);
    }
    const discTexture = new THREE.CanvasTexture(discCanvas);
    discTexture.colorSpace = THREE.SRGBColorSpace;

    const pointsMaterial = new THREE.PointsMaterial({
      size: 1.3,
      map: discTexture,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.NormalBlending,
      color: new THREE.Color(presetConfigRef.current.keyColor),
    });

    const particles = new THREE.Points(geometry, pointsMaterial);
    scene.add(particles);

    // 4. Floating 3D Gold Ribbon Curve
    const curvePoints: THREE.Vector3[] = [];
    for (let i = 0; i < 9; i++) {
      curvePoints.push(
        new THREE.Vector3(
          Math.sin(i * 0.75) * 9,
          (i - 4) * 2.6,
          Math.cos(i * 0.6) * 4.5
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.05, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(presetConfigRef.current.ribbonColor),
      transparent: true,
      opacity: presetConfigRef.current.ribbonOpacity,
      wireframe: true,
    });
    const ribbon = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(ribbon);

    // 5. Parallax & Motion Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let scrollY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 6. Render Loop with Exponential Damping & Lighting Preset Interpolation
    let frameId = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (!isVisible) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const activeConfig = presetConfigRef.current;

      // Smoothly interpolate scene lighting, fog, and materials toward target preset
      keyLight.color.lerp(new THREE.Color(activeConfig.keyColor), delta * 2.5);
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, activeConfig.keyIntensity, 3, delta);

      ambientFillLight.color.lerp(new THREE.Color(activeConfig.fillColor), delta * 2.5);
      ambientFillLight.intensity = THREE.MathUtils.damp(ambientFillLight.intensity, activeConfig.fillIntensity, 3, delta);

      tubeMat.color.lerp(new THREE.Color(activeConfig.ribbonColor), delta * 2.5);
      tubeMat.opacity = THREE.MathUtils.damp(tubeMat.opacity, activeConfig.ribbonOpacity, 2, delta);

      pointsMaterial.color.lerp(new THREE.Color(activeConfig.keyColor), delta * 2.5);

      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(new THREE.Color(activeConfig.fogColor), delta * 2.0);
        scene.fog.density = THREE.MathUtils.damp(scene.fog.density, activeConfig.fogDensity, 2, delta);
      }

      // Exponential damping for silky smooth parallax
      currentMouseX = THREE.MathUtils.damp(currentMouseX, targetMouseX, 2.5, delta);
      currentMouseY = THREE.MathUtils.damp(currentMouseY, targetMouseY, 2.5, delta);

      camera.position.x = currentMouseX * 1.5;
      camera.position.y = -currentMouseY * 1.0 - (scrollY * 0.003);
      camera.lookAt(0, -scrollY * 0.003, 0);

      ribbon.rotation.y = elapsed * 0.045;
      ribbon.rotation.x = Math.sin(elapsed * 0.08) * 0.18;

      const posAttr = geometry.attributes.position;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1] + Math.sin(elapsed + i) * 0.0025;
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around boundaries
        if (posArray[i * 3] > 16) posArray[i * 3] = -16;
        if (posArray[i * 3] < -16) posArray[i * 3] = 16;
        if (posArray[i * 3 + 1] > 11) posArray[i * 3 + 1] = -11;
        if (posArray[i * 3 + 1] < -11) posArray[i * 3 + 1] = 11;
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    // 7. Responsive Resize Handling
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      disposeThreeHierarchy(scene);
      discTexture.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      geometry.dispose();
      pointsMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const activeConfig = PRESET_CONFIGS[activePreset];

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-75 transition-opacity duration-1000"
      aria-hidden="true"
    />
  );
};
