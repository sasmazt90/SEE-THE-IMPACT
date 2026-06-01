'use client';

import { MessageCircle } from 'lucide-react';

interface ContactButtonProps {
  onClick: () => void;
  hidden?: boolean;
}

export default function ContactButton({ onClick, hidden = false }: ContactButtonProps) {
  if (hidden) return null;
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[55] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
      style={{
        background: '#E4FF3A',
        boxShadow: '0 0 24px rgba(228,255,58,0.5), 0 4px 16px rgba(0,0,0,0.4)',
      }}
      aria-label="Contact Us"
    >
      <MessageCircle className="w-5 h-5 text-[#0C0C0C]" />
    </button>
  );
}
