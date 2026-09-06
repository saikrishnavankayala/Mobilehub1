import React, { useState, useEffect, useRef } from 'react';
import { X, KeyRound, Clock, RotateCcw, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

interface OTPModalProps {
  isOpen: boolean;
  mobile: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({ isOpen, mobile, onClose, onSuccess }) => {
  const { verifyOtp, resendOtp, activeDevOtp } = useCustomer();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(120); // 2 minutes
  const [cooldown, setCooldown] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(120);
    setCooldown(60);
    setDigits(['', '', '', '', '', '']);
    setError(null);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleInputChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, 5);
    inputsRef.current[nextFocus]?.focus();
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timeLeft === 0) {
      setError('OTP has expired. Please click Resend OTP.');
      return;
    }

    setIsVerifying(true);
    setError(null);
    const result = await verifyOtp(mobile, otp);
    setIsVerifying(false);

    if (result.success) {
      onSuccess();
    } else {
      setAttempts((prev) => prev + 1);
      setError(result.message);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(null);
    setDigits(['', '', '', '', '', '']);
    const res = await resendOtp(mobile);
    if (res.success) {
      setTimeLeft(120);
      setCooldown(60);
      inputsRef.current[0]?.focus();
    } else {
      setError(res.message);
    }
  };

  const autofillDevOtp = () => {
    if (activeDevOtp && activeDevOtp.length === 6) {
      setDigits(activeDevOtp.split(''));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
            Verify Mobile Number
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            We sent a 6-digit OTP to <span className="font-mono text-slate-200 font-semibold">+91 {mobile}</span>
          </p>
        </div>

        {/* Development Mode Quick Hint Banner */}
        {activeDevOtp && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Dev Mock OTP: <strong>{activeDevOtp}</strong></span>
            </div>
            <button
              onClick={autofillDevOtp}
              type="button"
              className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-200 transition-colors"
            >
              Autofill
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-slate-950 border border-slate-700 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 rounded-xl text-white outline-none transition-all"
              />
            ))}
          </div>

          {/* Expiry & Attempts indicator */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Expires in: <strong className={timeLeft < 30 ? 'text-rose-400' : 'text-slate-300'}>{formatTime(timeLeft)}</strong>
            </span>
            <span>Attempts: {attempts}/3</span>
          </div>

          <button
            type="submit"
            disabled={isVerifying || digits.join('').length !== 6 || timeLeft === 0}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Unlock Spin</span>
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center pt-1">
            <button
              type="button"
              disabled={cooldown > 0}
              onClick={handleResend}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold inline-flex items-center gap-1.5 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
