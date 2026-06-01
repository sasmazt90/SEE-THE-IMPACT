'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, User, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserType = 'consumer' | 'brand';
type SubjectType = 'sponsored_advertising' | 'feedback_suggestion' | 'complaint';

const SUBJECT_OPTIONS: { value: SubjectType; label: string }[] = [
  { value: 'sponsored_advertising', label: 'Sponsored Advertising' },
  { value: 'feedback_suggestion', label: 'Feedback / Suggestion' },
  { value: 'complaint', label: 'Complaint' },
];

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [userType, setUserType] = useState<UserType>('consumer');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<SubjectType | ''>('');
  const [brandName, setBrandName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const resetForm = () => {
    setMessage('');
    setEmail('');
    setSubject('');
    setBrandName('');
    setErrors({});
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!message.trim()) {
      newErrors.message = 'Please enter a message';
    }

    if (userType === 'brand') {
      if (!email.trim()) {
        newErrors.email = 'Email is required for brand inquiries';
      }
      if (!brandName.trim()) {
        newErrors.brandName = 'Brand name is required';
      }
      if (!subject) {
        newErrors.subject = 'Please select a subject';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Get hashed IP
      const ipResponse = await fetch('/api/get-ip');
      const { ip_hash } = await ipResponse.json();

      if (!supabase) {
        throw new Error("Supabase is not configured");
      }

      // Insert into Supabase
      const { error: supabaseError } = await supabase
        .from('contact_messages')
        .insert({
          user_type: userType,
          message: message.trim(),
          email: email.trim() || null,
          subject: userType === 'brand' ? subject : null,
          brand_name: userType === 'brand' ? brandName.trim() : null,
          user_agent: window.navigator.userAgent,
          ip_hash,
        });

      if (supabaseError) {
        throw supabaseError;
      }

      toast({
        title: "Thanks!",
        description: "We received your message.",
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setErrors({ form: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative w-full max-w-md bg-black/70 backdrop-blur-[16px] rounded-xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Contact Us</h2>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            disabled={isSubmitting}
            className="relative z-10 p-2 rounded-lg bg-black/30 hover:bg-black/50 border border-white/10 hover:border-[#E4FF3A]/30 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70 hover:text-[#E4FF3A]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* User Type Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/90">I am...</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUserTypeChange('consumer')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  userType === 'consumer'
                    ? 'bg-[#E4FF3A]/20 border-[#E4FF3A]/50 text-[#E4FF3A]'
                    : 'bg-black/30 border-white/15 text-white/70 hover:border-white/30'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">A Consumer</span>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange('brand')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  userType === 'brand'
                    ? 'bg-[#E4FF3A]/20 border-[#E4FF3A]/50 text-[#E4FF3A]'
                    : 'bg-black/30 border-white/15 text-white/70 hover:border-white/30'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">A Brand</span>
              </button>
            </div>
          </div>

          {/* Brand-specific fields */}
          {userType === 'brand' && (
            <>
              {/* Subject Dropdown */}
              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-white/90">
                  Subject <span className="text-red-400">*</span>
                </label>
                <select
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as SubjectType)}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-lg text-white outline-none focus:border-[#E4FF3A]/50 focus:ring-1 focus:ring-[#E4FF3A]/30 transition-all disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-black text-white/50">Select a subject...</option>
                  {SUBJECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-black text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-red-400 text-sm">{errors.subject}</p>
                )}
              </div>

              {/* Brand Name */}
              <div className="space-y-2">
                <label htmlFor="brandName" className="block text-sm font-medium text-white/90">
                  Brand Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="brandName"
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Your brand name"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#E4FF3A]/50 focus:ring-1 focus:ring-[#E4FF3A]/30 transition-all disabled:opacity-50"
                />
                {errors.brandName && (
                  <p className="text-red-400 text-sm">{errors.brandName}</p>
                )}
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email {userType === 'brand' ? <span className="text-red-400">*</span> : <span className="text-white/50">(optional)</span>}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#E4FF3A]/50 focus:ring-1 focus:ring-[#E4FF3A]/30 transition-all disabled:opacity-50"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="block text-sm font-medium text-white/90">
              Your message <span className="text-red-400">*</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help you?"
              rows={4}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-black/30 border border-white/15 rounded-lg text-white placeholder:text-white/40 outline-none focus:border-[#E4FF3A]/50 focus:ring-1 focus:ring-[#E4FF3A]/30 transition-all resize-none disabled:opacity-50"
            />
            {errors.message && (
              <p className="text-red-400 text-sm">{errors.message}</p>
            )}
          </div>

          {/* GDPR Note */}
          <p className="text-white/50 text-xs leading-relaxed">
            Your message will be stored securely and used only for support purposes. No personal data is collected unless you choose to share it.
          </p>

          {/* Form Error */}
          {errors.form && (
            <p className="text-red-400 text-sm text-center">{errors.form}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[#D5FF3F] hover:bg-[#E0FF6F] text-[#0C0C0C] font-semibold rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Submit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
