'use client';

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';

const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const defaultOptions = {
  color: '59, 130, 246',
  size: 150,
  blur: 20,
  opacity: 0.4,
  transition: 200,
};

export function useConfinedGlow(options = {}) {
  const elementRef = useRef(null);
  const glowRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const isAnimatingRef = useRef(false);

  const config = useMemo(() => ({ ...defaultOptions, ...options }), [options]);

  const glowStyle = useMemo(
    () => ({
      position: 'absolute',
      pointerEvents: 'none',
      zIndex: 10,
      width: `${config.size}px`,
      height: `${config.size}px`,
      background: `radial-gradient(circle, rgba(${config.color}, ${config.opacity}) 0%, rgba(${config.color}, ${config.opacity * 0.5}) 50%, transparent 70%)`,
      borderRadius: '50%',
      filter: `blur(${config.blur}px)`,
      transition: `opacity ${config.transition}ms ease-out`,
      willChange: 'transform, opacity',
      transform: 'translate3d(-50%, -50%, 0)',
    }),
    [config.size, config.color, config.opacity, config.blur, config.transition],
  );

  const updateGlowPos = useCallback(
    throttle((e) => {
      if (!elementRef.current || !glowRef.current || !isAnimatingRef.current) return;

      const rect = elementRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glowRef.current.style.transform = `translate3d(${x - config.size / 2}px, ${y - config.size / 2}px, 0)`;
    }, 8),
    [config.size],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    isAnimatingRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    isAnimatingRef.current = false;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    element.addEventListener('mousemove', updateGlowPos, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', updateGlowPos);
    };
  }, [handleMouseEnter, handleMouseLeave, updateGlowPos]);

  const glowElement = (
    <div
      ref={glowRef}
      style={{
        ...glowStyle,
        opacity: isHovering ? 1 : 0,
      }}
    />
  );

  return {
    elementRef,
    glowElement,
    isHovering,
  };
}

export function GlowWrapper({
  children,
  className = '',
  glowOptions = {},
  as: Component = 'div',
  style = {},
  ...props
}) {
  const { elementRef, glowElement } = useConfinedGlow(glowOptions);

  const wrapperStyle = useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      contain: 'layout style paint',
      ...style,
    }),
    [style],
  );

  return (
    <Component ref={elementRef} className={className} style={wrapperStyle} {...props}>
      {glowElement}
      {children}
    </Component>
  );
}

export function GlowButton({ children, className = '', glowOptions = {}, style = {}, ...props }) {
  const { elementRef, glowElement } = useConfinedGlow(glowOptions);

  const buttonStyle = useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      contain: 'layout style paint',
      ...style,
    }),
    [style],
  );

  return (
    <button ref={elementRef} className={className} style={buttonStyle} {...props}>
      {glowElement}
      <span style={{ position: 'relative', zIndex: 20 }}>{children}</span>
    </button>
  );
}

export function GlowInput({
  className = '',
  glowOptions = {},
  style = {},
  wrapperStyle = {},
  ...props
}) {
  const { elementRef, glowElement } = useConfinedGlow(glowOptions);

  const containerStyle = useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      contain: 'layout style paint',
      ...wrapperStyle,
    }),
    [wrapperStyle],
  );

  const inputStyle = useMemo(
    () => ({
      position: 'relative',
      zIndex: 20,
      width: '100%',
      ...style,
    }),
    [style],
  );

  return (
    <div style={containerStyle}>
      {glowElement}
      <input ref={elementRef} className={className} style={inputStyle} {...props} />
    </div>
  );
}

export function GlowCard({ children, className = '', glowOptions = {}, style = {}, ...props }) {
  const { elementRef, glowElement } = useConfinedGlow(glowOptions);

  const cardStyle = useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      contain: 'layout style paint',
      ...style,
    }),
    [style],
  );

  return (
    <div ref={elementRef} className={className} style={cardStyle} {...props}>
      {glowElement}
      <div style={{ position: 'relative', zIndex: 20 }}>{children}</div>
    </div>
  );
}

export function GlowTextarea({
  className = '',
  glowOptions = {},
  style = {},
  wrapperStyle = {},
  ...props
}) {
  const { elementRef, glowElement } = useConfinedGlow(glowOptions);

  const containerStyle = useMemo(
    () => ({
      position: 'relative',
      overflow: 'hidden',
      isolation: 'isolate',
      contain: 'layout style paint',
      ...wrapperStyle,
    }),
    [wrapperStyle],
  );

  const textareaStyle = useMemo(
    () => ({
      position: 'relative',
      zIndex: 20,
      width: '100%',
      resize: 'vertical',
      ...style,
    }),
    [style],
  );

  return (
    <div style={containerStyle}>
      {glowElement}
      <textarea ref={elementRef} className={className} style={textareaStyle} {...props} />
    </div>
  );
}

export const glowPresets = {
  blue: { color: '59, 130, 246', size: 120, opacity: 0.4, blur: 20 },
  purple: { color: '168, 85, 247', size: 100, opacity: 0.5, blur: 15 },
  green: { color: '16, 185, 129', size: 110, opacity: 0.4, blur: 18 },
  red: { color: '244, 63, 94', size: 90, opacity: 0.6, blur: 25 },
  orange: { color: '251, 146, 60', size: 130, opacity: 0.4, blur: 22 },
  pink: { color: '236, 72, 153', size: 100, opacity: 0.5, blur: 20 },
  cyan: { color: '6, 182, 212', size: 115, opacity: 0.4, blur: 18 },
  yellow: { color: '250, 204, 21', size: 105, opacity: 0.3, blur: 16 },
  subtle: { color: '148, 163, 184', size: 80, opacity: 0.2, blur: 12 },
  intense: { color: '139, 92, 246', size: 160, opacity: 0.7, blur: 30 },
};

export function createGlowOptions(preset, customOptions = {}) {
  const presetOptions = glowPresets[preset] || glowPresets.blue;
  return { ...presetOptions, ...customOptions };
}
