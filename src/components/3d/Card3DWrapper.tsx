import React, { useRef, useState, useCallback } from 'react';
import { prefersReducedMotion } from './threeUtils';

interface Card3DWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxTiltDeg?: number;
  enableSpecularShine?: boolean;
}

export const Card3DWrapper: React.FC<Card3DWrapperProps> = ({
  children,
  className = '',
  maxTiltDeg = 7,
  enableSpecularShine = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>('');
  const [shineStyle, setShineStyle] = useState<{ opacity: number; x: number; y: number }>({
    opacity: 0,
    x: 50,
    y: 50,
  });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTiltDeg;
    const rotateY = ((x - centerX) / centerX) * maxTiltDeg;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    );

    if (enableSpecularShine) {
      setShineStyle({
        opacity: 0.18,
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    }
  }, [maxTiltDeg, enableSpecularShine]);

  const handleMouseLeave = useCallback(() => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setShineStyle((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative ${className}`}
    >
      {children}

      {/* Dynamic Specular 3D Light Sheen Overlay */}
      {enableSpecularShine && (
        <div
          className="pointer-events-none absolute inset-0 z-20 rounded-inherit transition-opacity duration-300"
          style={{
            opacity: shineStyle.opacity,
            background: `radial-gradient(circle at ${shineStyle.x}% ${shineStyle.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(212, 175, 55, 0.15) 30%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
