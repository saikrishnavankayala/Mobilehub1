import React, { useState } from 'react';
import { Trophy, Copy, Check, MapPin, Phone, Sparkles, Store, Calendar } from 'lucide-react';
import { SpinResultData } from '../../types';

interface ResultModalProps {
  isOpen: boolean;
  result: SpinResultData | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ isOpen, result, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.claim_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isTryAgain = result.prize.name.toLowerCase().includes('try again') || result.prize.name.toLowerCase().includes('better luck');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-fuchsia-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-fuchsia-950/60 overflow-hidden">
        {/* Background Glowing Orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-fuchsia-600/30 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* Trophy Header */}
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-amber-400 to-fuchsia-500 text-slate-950 shadow-xl shadow-amber-500/20 mb-3 animate-bounce-gentle">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="text-xs font-black tracking-widest uppercase text-fuchsia-400 flex items-center justify-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isTryAgain ? 'Thank You For Participating' : 'Official Spin & Win Winner'}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            {isTryAgain ? 'Keep Smiling!' : 'CONGRATULATIONS!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Registered customer: <strong className="text-slate-200">{result.customer.name}</strong> (+91 {result.customer.mobile})
          </p>

          {/* Winning Prize Card */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              YOU WON
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 font-['Outfit',sans-serif]">
              {result.prize.name}
            </h3>
            {result.prize.description && (
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                {result.prize.description}
              </p>
            )}

            {/* Claim Code Highlight Box */}
            <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-amber-500/40 relative">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-1">
                EXCLUSIVE CLAIM CODE
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest">
                  {result.claim_code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition-all shadow-md active:scale-95"
                  title="Copy claim code"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Status: <strong className="text-emerald-400 font-semibold">{result.status}</strong> (Valid for 7 Days)
              </span>
            </div>
          </div>

          {/* Store Redemption Details */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs space-y-2 mb-6">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              <Store className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Redemption Instructions:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Visit any Mobile Hub store counter, present this claim code (<strong className="text-slate-200">{result.claim_code}</strong>) along with your verified mobile number to receive your prize.
            </p>
            <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{result.store.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{result.store.phone}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-600/30 transition-all"
          >
            Done & Save Claim Code
          </button>
        </div>
      </div>
    </div>
  );
};
