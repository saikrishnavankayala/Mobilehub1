import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Phone,
  User,
  MapPin,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  Clock,
  RotateCcw,
  CheckCircle2,
  Gift,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

interface CustomerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type ModalStep = 'MOBILE_INPUT' | 'NEW_REGISTER' | 'OTP_VERIFY' | 'EXISTING_SUMMARY';

export const CustomerEntryModal: React.FC<CustomerEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const {
    checkMobile,
    register,
    verifyOtp,
    resendOtp,
    activeDevOtp,
    clearCustomerSession,
  } = useCustomer();

  const [step, setStep] = useState<ModalStep>('MOBILE_INPUT');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP state
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [cooldown, setCooldown] = useState<number>(60);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Existing customer summary state
  const [existingUser, setExistingUser] = useState<any>(null);
  const [existingSpinData, setExistingSpinData] = useState<any>(null);

  // Reset modal state whenever opened
  useEffect(() => {
    if (isOpen) {
      setStep('MOBILE_INPUT');
      setMobile('');
      setName('');
      setAddress('');
      setError(null);
      setDigits(['', '', '', '', '', '']);
      setExistingUser(null);
      setExistingSpinData(null);
      setTimeLeft(120);
      setCooldown(60);
    }
  }, [isOpen]);

  // OTP Timer countdown
  useEffect(() => {
    if (step !== 'OTP_VERIFY') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // STEP 1: Check mobile number
  const handleCheckMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10 || !['6', '7', '8', '9'].includes(cleanMobile[0])) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsSubmitting(true);
    try {
      const checkRes = await checkMobile(cleanMobile);
      setIsSubmitting(false);

      if (checkRes.exists && checkRes.customer) {
        // Existing Customer
        setExistingUser(checkRes.customer);
        setExistingSpinData(checkRes.spin);
        setName(checkRes.customer.name || '');
        setAddress(checkRes.customer.address || '');

        // Dispatch OTP to existing customer's mobile
        const otpRes = await resendOtp(cleanMobile);
        if (!otpRes.success) {
          setError(otpRes.message);
          return;
        }

        setTimeLeft(120);
        setCooldown(60);
        setStep('OTP_VERIFY');
      } else {
        // New Customer -> proceed to registration
        // Wipe any lingering session data so user starts completely clean
        clearCustomerSession();
        setStep('NEW_REGISTER');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || 'Failed to check mobile number. Please try again.');
    }
  };

  // STEP 2: New Customer Registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (!address.trim() || address.trim().length < 3) {
      setError('Please provide your address/locality (minimum 3 characters).');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, mobile, address);
    setIsSubmitting(false);

    if (result.success) {
      setTimeLeft(120);
      setCooldown(60);
      setStep('OTP_VERIFY');
    } else {
      setError(result.message);
    }
  };

  // STEP 3: OTP Digits handling
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
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

  const handleVerifyOtp = async (e?: React.FormEvent) => {
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

    setIsSubmitting(true);
    setError(null);
    const result = await verifyOtp(mobile, otp);
    setIsSubmitting(false);

    if (result.success) {
      // If existing user and has spun, show summary screen
      if (result.has_spun && result.spin) {
        setExistingSpinData(result.spin);
        setStep('EXISTING_SUMMARY');
      } else {
        // New user or unspun customer -> proceed to verification & spin
        onClose();
        if (onSuccess) onSuccess();
        navigate('/verify');
      }
    } else {
      setError(result.message);
    }
  };

  const handleResendOtp = async () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-surface-container-lowest border border-surface-container rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================= */}
        {/* SCREEN 1: ENTER MOBILE NUMBER (IDENTIFY CUSTOMER)         */}
        {/* ========================================================= */}
        {step === 'MOBILE_INPUT' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-on-surface font-headline-md tracking-tight">
                MobileHub Spin &amp; Win
              </h3>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Enter your 10-digit mobile number to begin or retrieve your lucky reward.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/20 text-error text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCheckMobile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                  Mobile Number (India)
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-surface-container bg-surface-container-high text-on-surface text-xs font-mono font-bold">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      autoFocus
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full bg-surface-container-low border border-surface-container rounded-r-xl pl-9 pr-4 py-3 text-sm text-on-surface font-mono placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-semibold"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-secondary mt-1 block">
                  Each mobile number receives strictly 1 promotional spin.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || mobile.length !== 10}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-on-primary bg-primary hover:bg-primary-container shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: NEW CUSTOMER REGISTRATION                       */}
        {/* ========================================================= */}
        {step === 'NEW_REGISTER' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-tertiary-fixed/40 text-tertiary mb-3">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-on-surface font-headline-md tracking-tight">
                New Participant Registration
              </h3>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                You're new to MobileHub! Complete your details to receive your spin.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/20 text-error text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Pre-filled Mobile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-surface-container-high border border-surface-container text-sm font-mono text-on-surface">
                  <span className="font-bold">+91 {mobile}</span>
                  <span className="text-[11px] font-bold text-primary uppercase">New Customer</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1.5">
                  Address / Locality
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-secondary absolute left-3.5 top-3" />
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Tadepalligudem, Andhra Pradesh"
                    className="w-full bg-surface-container-low border border-surface-container rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('MOBILE_INPUT')}
                  className="py-2.5 px-4 rounded-xl border border-surface-container text-secondary text-xs font-bold hover:bg-surface-container transition-colors"
                >
                  Change Number
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-sm text-on-primary bg-primary hover:bg-primary-container shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue to OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: OTP VERIFICATION                                */}
        {/* ========================================================= */}
        {step === 'OTP_VERIFY' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-on-surface font-headline-md tracking-tight">
                Verify Mobile Number
              </h3>
              <p className="text-xs sm:text-sm text-secondary mt-1">
                Enter the 6-digit OTP sent to <span className="font-mono font-bold text-on-surface">+91 {mobile}</span>
              </p>
            </div>

            {/* Development Mock OTP Helper */}
            {activeDevOtp && (
              <div className="mb-4 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>Dev Mock OTP: <strong>{activeDevOtp}</strong></span>
                </div>
                <button
                  onClick={autofillDevOtp}
                  type="button"
                  className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  Autofill
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-error-container/40 border border-error/20 text-error text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold font-mono bg-surface-container-low border border-surface-container focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-on-surface outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-secondary px-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-secondary" />
                  Expires in: <strong className={timeLeft < 30 ? 'text-error' : 'text-on-surface'}>{formatTime(timeLeft)}</strong>
                </span>
                <button
                  type="button"
                  disabled={cooldown > 0}
                  onClick={handleResendOtp}
                  className="text-primary hover:underline font-semibold inline-flex items-center gap-1 disabled:text-outline disabled:no-underline cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || digits.join('').length !== 6 || timeLeft === 0}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-on-primary bg-primary hover:bg-primary-container shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Continue</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: EXISTING CUSTOMER SUMMARY & REWARD RECAP        */}
        {/* ========================================================= */}
        {step === 'EXISTING_SUMMARY' && existingSpinData && (
          <div className="text-center">
            <div className="inline-flex p-3 rounded-2xl bg-tertiary-fixed/40 text-tertiary mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-on-surface font-headline-md tracking-tight">
              Welcome Back!
            </h3>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              Hello <strong className="text-on-surface">{existingUser?.name || 'Customer'}</strong> (+91 {mobile}). You have already completed your promotional spin.
            </p>

            {/* Reward Card */}
            <div className="w-full my-5 p-4 rounded-xl bg-surface-container-low border border-surface-container text-left flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                <Gift className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase text-primary tracking-wider">
                  Your Winning Reward
                </div>
                <div className="font-headline-sm text-sm sm:text-base font-extrabold text-on-surface mt-0.5 truncate">
                  {existingSpinData.prize?.name || existingSpinData.prize_name || 'Promotional Offer'}
                </div>
                <div className="mt-2 text-xs text-secondary flex items-center justify-between">
                  <span>Claim Code:</span>
                  <span className="font-mono font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded">
                    {existingSpinData.claim_code}
                  </span>
                </div>
                <div className="mt-1 text-xs text-secondary flex items-center justify-between">
                  <span>Status:</span>
                  <span className={`font-bold uppercase text-[11px] ${existingSpinData.status === 'CLAIMED' ? 'text-secondary' : 'text-tertiary'}`}>
                    {existingSpinData.status || 'GENERATED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (existingSpinData.status === 'CLAIMED') {
                    navigate('/success');
                  } else {
                    navigate('/claim');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-on-primary bg-primary hover:bg-primary-container shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>View Reward / Claim Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/spin');
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-surface-container text-on-surface text-xs font-bold hover:bg-surface-container transition-colors cursor-pointer"
              >
                View Wheel &amp; Participation Status
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
