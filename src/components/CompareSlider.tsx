'use client';

import { useEffect, useRef } from 'react';

interface CompareSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function CompareSlider({ value, onChange }: CompareSliderProps) {
  const onChangeRef = useRef(onChange);
  
  // Keep onChange ref updated to avoid stale closures
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Directly calculate and update - no throttling, no delay, 1:1 sync
      const percentage = Math.max(0, Math.min(100, (e.clientX / window.innerWidth) * 100));
      onChangeRef.current(percentage);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const percentage = Math.max(0, Math.min(100, (touch.clientX / window.innerWidth) * 100));
        onChangeRef.current(percentage);
      }
    };

    // Listen for mouse movement across the entire window
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    // Listen for touch movement for mobile
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[16] pointer-events-none">
      {/* Slider handle - NO transition for instant 1:1 sync with mouse */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ 
          left: `${value}%`,
          width: '3px',
          marginLeft: '-1.5px'
        }}
      >
        {/* Vertical line - neon yellow with glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: '#E4FF3A',
            boxShadow: '0 0 14px rgba(228,255,58,0.3), 0 0 28px rgba(228,255,58,0.2)'
          }}
        />
        
        {/* Center handle - soft circular knob with yellow styling (visual only, no drag) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center"
            style={{
              border: '3px solid #E4FF3A',
              boxShadow: '0 0 16px rgba(228,255,58,0.3), 0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            <div className="flex gap-1">
              <div 
                className="w-0.5 h-4 rounded-full" 
                style={{ backgroundColor: 'rgba(228,255,58,0.7)' }}
              />
              <div 
                className="w-0.5 h-4 rounded-full" 
                style={{ backgroundColor: 'rgba(228,255,58,0.7)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
