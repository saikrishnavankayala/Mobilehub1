import React, { useState } from 'react';
import { X, Instagram, Facebook, MessageCircle, CheckCircle2, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

interface SocialTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SocialTasksModal: React.FC<SocialTasksModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { campaign, completeSocialTasks } = useCustomer();
  const [visitedLinks, setVisitedLinks] = useState<{ [key: string]: boolean }>({
    instagram: false,
    facebook: false,
    whatsapp: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleOpenLink = (network: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setVisitedLinks((prev) => ({ ...prev, [network]: true }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const success = await completeSocialTasks();
    setIsSubmitting(false);
    if (success) {
      onSuccess();
    }
  };

  const hasEngaged = visitedLinks.instagram || visitedLinks.facebook || visitedLinks.whatsapp;

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
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
            Follow Mobile Hub
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete the promotional requirements to activate your 1 guaranteed Spin & Win entry!
          </p>
        </div>

        {/* Social Buttons List */}
        <div className="space-y-3 mb-6">
          {/* Instagram */}
          <button
            type="button"
            onClick={() => handleOpenLink('instagram', campaign?.instagram_url || 'https://instagram.com')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              visitedLinks.instagram
                ? 'bg-pink-950/30 border-pink-500/50 text-pink-200'
                : 'bg-slate-950/60 border-slate-800 hover:border-pink-500/40 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold block">Follow on Instagram</span>
                <span className="text-[11px] text-slate-400">@mobilehub_official</span>
              </div>
            </div>
            {visitedLinks.instagram ? (
              <CheckCircle2 className="w-5 h-5 text-pink-400" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Facebook */}
          <button
            type="button"
            onClick={() => handleOpenLink('facebook', campaign?.facebook_url || 'https://facebook.com')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              visitedLinks.facebook
                ? 'bg-blue-950/30 border-blue-500/50 text-blue-200'
                : 'bg-slate-950/60 border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold block">Follow on Facebook</span>
                <span className="text-[11px] text-slate-400">Mobile Hub Official</span>
              </div>
            </div>
            {visitedLinks.facebook ? (
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* WhatsApp */}
          <button
            type="button"
            onClick={() => handleOpenLink('whatsapp', campaign?.whatsapp_url || 'https://whatsapp.com')}
            className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all ${
              visitedLinks.whatsapp
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold block">Join WhatsApp Channel</span>
                <span className="text-[11px] text-slate-400">Instant VIP drops & deals</span>
              </div>
            </div>
            {visitedLinks.whatsapp ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <ExternalLink className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>

        {/* Confirmation Button */}
        <button
          type="button"
          disabled={isSubmitting || !hasEngaged}
          onClick={handleConfirm}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-lg shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>I Have Followed / Proceed to Spin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
