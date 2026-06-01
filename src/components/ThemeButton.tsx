'use client';

import { Shuffle } from 'lucide-react';

interface ThemeButtonProps {
  onClick: () => void;
}

export default function ThemeButton({ onClick }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-8 right-8 z-50 group"
      aria-label="Change theme"
    >
      <div className="relative">
        {/* Button - frosted glass style with yellow glow */}
        <div 
          className="relative p-3 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 hover:border-[#E4FF3A]/50 transition-all duration-300"
          style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 0 16px rgba(228,255,58,0.3)'
          }}
        >
          <Shuffle 
            className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" 
            style={{ color: '#E4FF3A' }}
          />
        </div>
      </div>
    </button>
  );
}
