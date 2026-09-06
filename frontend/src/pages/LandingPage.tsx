import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { CustomerEntryModal } from '../components/customer/CustomerEntryModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, hasSpun } = useCustomer();

  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Auto-rotating preview wheel matching the user's template
  useEffect(() => {
    const interval = setInterval(() => {
      setWheelRotation((prev) => prev + 45);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (!customer) {
      setIsEntryOpen(true);
    } else if (!customer.otp_verified) {
      setIsEntryOpen(true);
    } else if (hasSpun) {
      navigate('/spin');
    } else if (!customer.social_verified) {
      navigate('/verify');
    } else {
      navigate('/spin');
    }
  };


  return (
    <div className="flex flex-col w-full px-margin-mobile gap-space-xl max-w-lg mx-auto">
      {/* Section 1: Hero */}
      <section className="relative flex flex-col items-center text-center pt-space-md overflow-hidden">
        {/* Season Badge */}
        <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-surface-container shadow-sm mb-space-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-bold">
            MobileHub 2026 Season
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight max-w-[340px] font-extrabold">
          Spin. Win. <br />
          <span className="text-primary">Get Rewarded.</span>
        </h1>

        {/* Subtitle */}
        <p className="font-body-md text-body-md text-secondary mt-space-xs max-w-[330px]">
          Join MobileHub, follow our social channels, verify your participation, and get a chance to win exciting rewards.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-space-sm w-full mt-space-lg">
          <button
            type="button"
            onClick={handleGetStarted}
            className="flex-1 max-w-[170px] h-12 bg-primary text-on-primary rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-2xs shadow-[0_8px_20px_-4px_rgba(227,27,35,0.38)] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span>Get Started</span>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </button>

          <a
            href="#how-it-works"
            className="flex-1 max-w-[150px] h-12 bg-surface-container-lowest text-on-surface rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center shadow-sm active:scale-[0.98] transition-transform border border-surface-container"
          >
            How It Works
          </a>
        </div>

        {/* Rotating Interactive Wheel Preview */}
        <div className="relative w-full max-w-[320px] aspect-square mt-space-lg flex items-center justify-center">
          <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/15 via-transparent to-primary/5 blur-2xl -z-10" />
          <div className="relative w-64 h-64 rounded-full bg-surface-container-lowest p-2 shadow-[0_16px_36px_-8px_rgba(17,17,17,0.14),0_2px_8px_rgba(17,17,17,0.06)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-surface-container-highest p-1 flex items-center justify-center shadow-inner">
              <div
                className="relative w-full h-full rounded-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] transition-transform duration-1000 ease-out"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                <svg className="w-full h-full transform -rotate-30" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" fill="#f5f3f3" r="98" />
                  {/* 6 equal 60-degree segments */}
                  <path d="M100 100 L100 2 A98 98 0 0 1 184.87 51 Z" fill="#b90014" />
                  <path d="M100 100 L184.87 51 A98 98 0 0 1 184.87 149 Z" fill="#ffffff" />
                  <path d="M100 100 L184.87 149 A98 98 0 0 1 100 198 Z" fill="#e31b23" />
                  <path d="M100 100 L100 198 A98 98 0 0 1 15.13 149 Z" fill="#ffffff" />
                  <path d="M100 100 L15.13 149 A98 98 0 0 1 15.13 51 Z" fill="#b90014" />
                  <path d="M100 100 L15.13 51 A98 98 0 0 1 100 2 Z" fill="#ffffff" />
                  <circle cx="100" cy="100" fill="none" r="88" stroke="#e3e2e2" strokeDasharray="2 6" strokeWidth="1" />
                  {/* 6 perimeter studs */}
                  <circle cx="184.87" cy="51" fill="#b90014" opacity="0.9" r="3" />
                  <circle cx="184.87" cy="149" fill="#ffffff" opacity="0.9" r="3" />
                  <circle cx="100" cy="198" fill="#b90014" opacity="0.9" r="3" />
                  <circle cx="15.13" cy="149" fill="#ffffff" opacity="0.9" r="3" />
                  <circle cx="15.13" cy="51" fill="#b90014" opacity="0.9" r="3" />
                  <circle cx="100" cy="2" fill="#ffffff" opacity="0.9" r="3" />
                </svg>
              </div>
            </div>

            {/* Top Indicator Arrow */}
            <div className="absolute -top-1 z-20 flex flex-col items-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
              <div className="w-5 h-6 bg-gradient-to-b from-[#ffdad6] to-primary rounded-t-sm flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-surface-container-lowest" />
              </div>
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-primary" />
            </div>

            {/* Center Star Emblem */}
            <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.16)] flex items-center justify-center p-1.5 pointer-events-none">
              <div className="w-full h-full rounded-full bg-gradient-to-b from-primary to-on-primary-fixed-variant flex items-center justify-center text-on-primary shadow-inner">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  stars
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Trust Highlights */}
      <section className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60">
        <div className="flex items-center justify-center gap-space-xs text-center mb-space-md">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
            MobileHub Rewards — Follow. Verify. Spin. Win.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-space-2xs text-center">
          <div className="flex flex-col items-center gap-space-2xs px-1">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Verified Campaign</span>
          </div>
          <div className="flex flex-col items-center gap-space-2xs px-1">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">100% Free Entry</span>
          </div>
          <div className="flex flex-col items-center gap-space-2xs px-1">
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Instant Reward Codes</span>
          </div>
        </div>
      </section>

      {/* Section 3: How It Works */}
      <section className="flex flex-col gap-space-md" id="how-it-works">
        <div className="flex flex-col gap-space-2xs">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Simple Process</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">How It Works</h2>
        </div>
        <div className="flex flex-col gap-space-sm">
          <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-headline-sm text-headline-sm font-bold">
              01
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Join MobileHub</h3>
              <p className="font-body-md text-body-md text-secondary mt-space-2xs">
                Enter the official campaign with your phone number and unlock real-time participant status.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-headline-sm text-headline-sm font-bold">
              02
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Follow Us</h3>
              <p className="font-body-md text-body-md text-secondary mt-space-2xs">
                Follow MobileHub across Instagram, Facebook, and WhatsApp channels for official updates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
            <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary font-headline-sm text-headline-sm font-bold">
              03
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Verify &amp; Spin</h3>
              <p className="font-body-md text-body-md text-secondary mt-space-2xs">
                Complete instant automated channel verification to unlock your free token on the reward wheel.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface font-headline-sm text-headline-sm font-bold">
              04
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Claim Your Reward</h3>
              <p className="font-body-md text-body-md text-secondary mt-space-2xs">
                Submit delivery or digital redemption details to receive your confirmed prize voucher within minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Rewards Catalog */}
      <section className="flex flex-col gap-space-md" id="rewards-catalog">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-space-2xs">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">Rewards Catalog</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">What Could You Win?</h2>
          </div>
          <span className="font-label-md text-label-md text-secondary font-semibold">6 Spin Offers</span>
        </div>

        <div className="grid grid-cols-2 gap-space-sm">
          {/* Prize 1: Accessories */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="Mobile Accessories"
                src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                50% OFF
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">Accessories</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">All Mobile Accessories</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-primary font-bold">50% Discount</span>
            </div>
          </div>

          {/* Prize 2: Mobiles */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="Mobiles 5% discount"
                src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold">
                5% OFF
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">Mobiles</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">Latest Smartphones</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-on-surface font-bold">5% Discount</span>
            </div>
          </div>

          {/* Prize 3: Neck Band */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="Wireless Bluetooth Neck Band"
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                @ ₹149/-
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">Neck Band</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">Wireless Bluetooth</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-primary font-bold">Buy @ ₹149/-</span>
            </div>
          </div>

          {/* Prize 4: TWS Buds */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="TWS Buds"
                src="https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold">
                @ ₹399/-
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">TWS Buds</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">True Wireless Audio</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-on-surface font-bold">Buy @ ₹399/-</span>
            </div>
          </div>

          {/* Prize 5: Smart Watch */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="Smart Watch"
                src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-bold">
                @ ₹799/-
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">Smart Watch</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">HD AMOLED Edition</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-primary font-bold">Buy @ ₹799/-</span>
            </div>
          </div>

          {/* Prize 6: Glass Protection */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-surface-container/60">
            <div className="relative w-full h-32 bg-surface-container-low flex items-center justify-center overflow-hidden">
              <img
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                alt="Tempered Glass Protection"
                src="https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=400&q=80"
              />
              <span className="absolute top-2 left-2 px-space-xs py-space-2xs rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold">
                @ ₹49/-
              </span>
            </div>
            <div className="p-space-sm flex flex-col flex-1 justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 font-bold">Glass Protection</h3>
                <p className="font-body-sm text-body-sm text-secondary mt-space-2xs">9H Tempered Screen Care</p>
              </div>
              <span className="mt-space-sm font-label-md text-label-md text-on-surface font-bold">Buy @ ₹49/-</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Bottom CTA */}
      <section className="flex flex-col bg-on-surface rounded-xl p-space-lg text-center gap-space-md shadow-lg relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-primary/20 blur-xl pointer-events-none" />
        <div className="flex flex-col gap-space-2xs relative z-10">
          <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider font-bold">Free To Enter</span>
          <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-surface-container-lowest tracking-tight font-extrabold">
            Ready to Try Your Luck?
          </h2>
          <p className="font-body-sm text-body-sm text-surface-dim mt-space-2xs max-w-[280px] mx-auto">
            Verify your identity in seconds to receive your spin token. No purchase necessary.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/verify')}
          className="h-12 w-full bg-primary text-on-primary rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs shadow-[0_8px_20px_-4px_rgba(227,27,35,0.48)] active:scale-[0.98] transition-transform relative z-10 cursor-pointer"
        >
          <span>Continue to Verification</span>
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </button>
      </section>

      {/* Customer Entry & Login Modal */}
      <CustomerEntryModal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        onSuccess={() => setIsEntryOpen(false)}
      />
    </div>
  );
};

