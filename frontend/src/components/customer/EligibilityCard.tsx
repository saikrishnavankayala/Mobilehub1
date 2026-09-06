import React from 'react';
import { CheckCircle2, XCircle, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

interface EligibilityCardProps {
  onSpinClick: () => void;
  onViewResultClick: () => void;
  onCompleteSocial: () => void;
  onRegisterClick: () => void;
}

export const EligibilityCard: React.FC<EligibilityCardProps> = ({
  onSpinClick,
  onViewResultClick,
  onCompleteSocial,
  onRegisterClick,
}) => {
  const { customer, eligibility } = useCustomer();

  const isRegistered = !!customer;
  const isOtpVerified = !!customer?.otp_verified;
  const isSocialVerified = !!customer?.social_verified;
  const isAlreadySpun = !!eligibility?.details?.already_spun;
  const isEligible = !!eligibility?.eligible && !isAlreadySpun;

  return (
    <div className="w-full max-w-lg mx-auto glass-panel-glow rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Background Decorative Blob */}
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg text-white font-['Outfit',sans-serif] tracking-tight">
              Campaign Eligibility Status
            </h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            1 Mobile = 1 Spin
          </span>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3 mb-6">
          {/* Step 1 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              1. Customer Registration
            </span>
            {isRegistered ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Complete
              </span>
            ) : (
              <button
                onClick={onRegisterClick}
                className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 underline"
              >
                Register Now
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              2. Mobile OTP Verification
            </span>
            {isOtpVerified ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Verified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <XCircle className="w-4 h-4" /> Pending
              </span>
            )}
          </div>

          {/* Step 3 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              3. Social Media Participation
            </span>
            {isSocialVerified ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Complete
              </span>
            ) : isOtpVerified ? (
              <button
                onClick={onCompleteSocial}
                className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 underline"
              >
                Complete Tasks
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <XCircle className="w-4 h-4" /> Pending
              </span>
            )}
          </div>
        </div>

        {/* Status Callout & Action */}
        {isAlreadySpun ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
            <div className="inline-flex p-2.5 rounded-full bg-amber-500/20 text-amber-300 mb-2">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              Spin Chance Already Used!
            </h4>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              You have already claimed your 1 promotional spin for this mobile number.
            </p>
            <button
              onClick={onViewResultClick}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>View Your Prize & Claim Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isEligible ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <div className="text-xs font-black tracking-wider uppercase text-emerald-400 mb-1">
              ✓ All Requirements Met
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif] tracking-tight neon-text-glow">
              YOU ARE ELIGIBLE!
            </h4>
            <p className="text-xs text-slate-300 mt-1 mb-4">
              Tap the button below to trigger your spin on the wheel!
            </p>
            <button
              onClick={onSpinClick}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-xl shadow-fuchsia-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>SPIN NOW</span>
            </button>
          </div>
        ) : !isRegistered ? (
          <button
            onClick={onRegisterClick}
            className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Registration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : !isOtpVerified ? (
          <button
            onClick={onRegisterClick}
            className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 transition-all flex items-center justify-center gap-2"
          >
            <span>Verify Mobile OTP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onCompleteSocial}
            className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-pink-600 to-rose-600 transition-all flex items-center justify-center gap-2"
          >
            <span>Complete Social Follow (Required)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
