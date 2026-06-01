'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface TopBrandsButtonProps {
  onClick: () => void;
}

export default function TopBrandsButton({ onClick }: TopBrandsButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50 group"
      aria-label="Top 10 sustainable brands"
    >
      <div className="relative">
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 whitespace-nowrap animate-in fade-in duration-200 hidden sm:block">
            <span className="text-white/90 text-sm">Top 10 sustainable brands</span>
          </div>
        )}

        {/* Button - frosted glass style with yellow glow */}
        <div 
          className="relative p-2.5 sm:p-3 bg-black/25 backdrop-blur-md rounded-xl border border-white/20 hover:border-[#E4FF3A]/50 transition-all duration-300"
          style={{
            boxShadow: '0 4px 16px rgba(0,0,0,0.25), 0 0 16px rgba(228,255,58,0.3)'
          }}
        >
          <Star 
            className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" 
            style={{ color: '#E4FF3A', fill: '#E4FF3A' }}
          />
        </div>
      </div>
    </button>
  );
}
