import React, { useState } from 'react';
import { X, User, Phone, MapPin, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (mobile: string) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { register } = useCustomer();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend Indian mobile format validation
    const cleanMobile = mobile.trim().replace('+91', '').replace(/[\s-]/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!mobileRegex.test(cleanMobile)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setError('Please provide your address/locality (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, cleanMobile, address);
    setIsSubmitting(false);

    if (result.success) {
      onSuccess(cleanMobile);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-fuchsia-950/40">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
            Join Spin & Win
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter your details to receive your 1 guaranteed lucky spin!
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Mobile Number (India)
            </label>
            <div className="relative flex">
              <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800/60 text-slate-400 text-xs font-mono">
                +91
              </span>
              <div className="relative flex-1">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-r-xl pl-9 pr-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Must be a 10-digit number starting with 6, 7, 8, or 9
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Address / Locality
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. 402 Lakeview Apts, Outer Ring Road, Bengaluru"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue to OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
