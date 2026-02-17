import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const MagneticButton = ({ children, className = "", onClick, disabled = false }: MagneticButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    // When disabled becomes true, reset any in-flight translation and bail out
    if (disabled) {
      gsap.to(btn, { x: 0, y: 0, duration: 0.2, ease: "power2.out" });
      return;
    }
    
    const mouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: "power2.out" });
    };
    
    const mouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    };
    
    btn.addEventListener('mousemove', mouseMove);
    btn.addEventListener('mouseleave', mouseLeave);
    return () => {
      btn.removeEventListener('mousemove', mouseMove);
      btn.removeEventListener('mouseleave', mouseLeave);
    };
  }, [disabled]);

  const handleClick = () => {
    if (!disabled && onClick) onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
    }
  };

  return (
    <button
      ref={btnRef}
      className={`relative group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {!disabled && (
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      )}
    </button>
  );
};
