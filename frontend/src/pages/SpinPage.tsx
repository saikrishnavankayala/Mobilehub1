import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../services/api';

export interface WheelOffer {
  id: number;
  category: string;
  offer: string;
  popupTitle: string;
  popupOffer: string;
  badge: string;
  tag: string;
  bgType: 'red' | 'white';
}

export const WHEEL_OFFERS: WheelOffer[] = [
  {
    id: 0,
    category: 'Accessories',
    offer: '50% Discount on Accessories',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won 50% Discount on Accessories',
    badge: '50% OFF',
    tag: 'DISCOUNT',
    bgType: 'red',
  },
  {
    id: 1,
    category: 'Mobiles',
    offer: '5% Discount on Mobiles',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won 5% Discount on Mobiles',
    badge: '5% OFF',
    tag: 'SPECIAL',
    bgType: 'white',
  },
  {
    id: 2,
    category: 'Neck Band',
    offer: 'Buy @ ₹149/- Neck Band',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won a Neck Band @ ₹149/-',
    badge: '@ ₹149',
    tag: 'DEAL',
    bgType: 'red',
  },
  {
    id: 3,
    category: 'TWS Buds',
    offer: 'Buy @ ₹399/- TWS Buds',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won TWS Buds @ ₹399/-',
    badge: '@ ₹399',
    tag: 'AUDIO',
    bgType: 'white',
  },
  {
    id: 4,
    category: 'Smart Watch',
    offer: 'Buy @ ₹799/- Smart Watch',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won a Smart Watch @ ₹799/-',
    badge: '@ ₹799',
    tag: 'GADGET',
    bgType: 'red',
  },
  {
    id: 5,
    category: 'Glass Protection',
    offer: 'Buy @ ₹49/- Glass Protection',
    popupTitle: '🎉 Congratulations!',
    popupOffer: 'You Won Glass Protection @ ₹49/-',
    badge: '@ ₹49',
    tag: 'CARE',
    bgType: 'white',
  },
];

export const SpinPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, refreshEligibility } = useCustomer();

  const [isSpinning, setIsSpinning] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasAlreadySpun, setHasAlreadySpun] = useState<boolean>(false);
  const [existingSpinData, setExistingSpinData] = useState<any>(null);
  const [spinErrorMsg, setSpinErrorMsg] = useState<string | null>(null);

  const [rotationDeg, setRotationDeg] = useState(0);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<WheelOffer | null>(null);
  const [claimCode, setClaimCode] = useState('');
  const [showModal, setShowModal] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Mechanical ticker sound
  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, audioCtxRef.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, audioCtxRef.current.currentTime + 0.025);
        gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.025);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.025);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const isVerifiedParticipant =
    Boolean(customer?.social_verified) ||
    (Boolean(customer?.mobile) && localStorage.getItem('mobile_hub_social_verified') === 'true');

  // Check spin status from backend on mount or when customer changes
  const checkStatus = useCallback(async () => {
    const mobile = customer?.mobile || localStorage.getItem('mobile_hub_user_mobile') || '';
    if (!mobile) {
      setHasAlreadySpun(false);
      setExistingSpinData(null);
      return;
    }
    try {
      const res = await api.get('/spin/status', {
        params: { mobileNumber: mobile },
      });
      if (res.data?.has_spun) {
        setHasAlreadySpun(true);
        localStorage.setItem('mobile_hub_spin_completed', 'true');
        if (res.data.spin) {
          setExistingSpinData(res.data.spin);
          if (res.data.spin.claim_code) {
            setClaimCode(res.data.spin.claim_code);
          }
          const prizeName = res.data.spin.prize?.name || res.data.spin.prize_name;
          const match = WHEEL_OFFERS.find(
            (o) =>
              o.offer === prizeName ||
              o.category === res.data.spin.prize?.category ||
              o.category === res.data.spin.category
          );
          if (match) setSelectedOffer(match);
        }
      } else {
        setHasAlreadySpun(false);
        setExistingSpinData(null);
        localStorage.removeItem('mobile_hub_spin_completed');
        localStorage.removeItem('mobile_hub_last_win');
      }
    } catch {
      // Offline fallback: verify against current user's stored session
      const storedMobile = localStorage.getItem('mobile_hub_user_mobile');
      if (storedMobile === mobile && localStorage.getItem('mobile_hub_spin_completed') === 'true') {
        setHasAlreadySpun(true);
      } else {
        setHasAlreadySpun(false);
      }
    }
  }, [customer?.mobile]);


  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const triggerWheelSpin = async () => {
    if (!isVerifiedParticipant) {
      navigate('/verify');
      return;
    }

    // STRICT CHECK: Reject immediately if user has already spun
    if (hasAlreadySpun) {
      setSpinErrorMsg(
        'This mobile number has already participated in the MobileHub reward campaign. Only one spin is allowed per mobile number.'
      );
      return;
    }

    if (isSpinning || isChecking) return;

    setIsChecking(true);
    setSpinErrorMsg(null);

    const mobile = customer?.mobile || localStorage.getItem('mobile_hub_user_mobile') || '';

    try {
      // Call backend /api/spin BEFORE touching or rotating the wheel
      const res = await api.post('/spin', {
        mobileNumber: mobile || undefined,
      });

      if (!res.data?.success) {
        setIsChecking(false);
        setHasAlreadySpun(true);
        setSpinErrorMsg(
          res.data?.message ||
            'This mobile number has already participated in the MobileHub reward campaign. Only one spin is allowed per mobile number.'
        );
        if (res.data?.data) {
          setExistingSpinData(res.data.data);
        }
        return;
      }

      // Backend authorized and allocated genuine prize!
      const spinResult = res.data.data;
      let targetIndex = 0;
      if (typeof spinResult.segment_index === 'number' && spinResult.segment_index >= 0 && spinResult.segment_index < 6) {
        targetIndex = spinResult.segment_index;
      } else if (spinResult.prize?.name) {
        const found = WHEEL_OFFERS.findIndex((o) => o.offer === spinResult.prize.name);
        if (found !== -1) targetIndex = found;
      }

      const wonCode = spinResult.claim_code || `MH-${Math.floor(100000 + Math.random() * 900000)}`;
      const wonOffer = WHEEL_OFFERS[targetIndex] || WHEEL_OFFERS[0];

      setSelectedOffer(wonOffer);
      setClaimCode(wonCode);

      // Save win details to localStorage
      localStorage.setItem(
        'mobile_hub_last_win',
        JSON.stringify({
          prizeName: wonOffer.offer,
          prizeValue: wonOffer.badge,
          category: wonOffer.category,
          claimCode: wonCode,
          timestamp: new Date().toISOString(),
        })
      );
      localStorage.setItem('mobile_hub_spin_completed', 'true');

      setIsChecking(false);
      setIsSpinning(true);

      // 3. Mathematical angle calculation for 6 segments (60° each):
      // Segment 0 is centered at 0° (top indicator).
      // Segment k is centered at (k * 60)° clockwise.
      // To bring segment k to top (0°), the disc stops at angle: (360 - (k * 60)) % 360
      const targetAngle = (360 - (targetIndex * 60)) % 360;
      const currentAngleMod = currentRotation % 360;
      const deltaAngle = (targetAngle - currentAngleMod + 360) % 360;
      const fullSpins = 6;
      const jitter = Math.random() * 20 - 10;
      const newTargetDeg = currentRotation + fullSpins * 360 + deltaAngle + jitter;

      setRotationDeg(newTargetDeg);
      setCurrentRotation(newTargetDeg);

      // 4. Audio ticker interval
      const tickInterval = setInterval(() => {
        playTickSound();
      }, 150);

      // 5. Deceleration completion (4800ms)
      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setHasAlreadySpun(true);
        setShowModal(true);

        // Celebratory Confetti Burst
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#b90014', '#e31b23', '#006846', '#ffd700', '#ffffff'],
        });

        if (refreshEligibility) refreshEligibility();
      }, 4900);
    } catch (err: any) {
      setIsChecking(false);
      setIsSpinning(false);

      const errData = err.response?.data;
      if (errData?.code === 'SPIN_ALREADY_USED' || err.response?.status === 409) {
        // PERMANENT BLOCK: The user has already spun
        setHasAlreadySpun(true);
        localStorage.setItem('mobile_hub_spin_completed', 'true');
        setSpinErrorMsg(
          errData?.message ||
            'This mobile number has already participated in the MobileHub reward campaign. Only one spin is allowed per mobile number.'
        );
        if (errData?.data) {
          setExistingSpinData(errData.data);
          if (errData.data.claim_code) setClaimCode(errData.data.claim_code);
          const match = WHEEL_OFFERS.find(
            (o) =>
              o.offer === errData.data.prize_name ||
              o.category === errData.data.category
          );
          if (match) setSelectedOffer(match);
        }
        return; // DO NOT ANIMATE WHEEL!
      }

      setSpinErrorMsg(
        errData?.message ||
          'Unable to verify spin eligibility. Please verify your connection or social steps and try again.'
      );
    }
  };

  const handleClaimOffer = () => {
    if (!selectedOffer) return;
    localStorage.setItem(
      'mobile_hub_last_win',
      JSON.stringify({
        prizeName: selectedOffer.offer,
        prizeValue: selectedOffer.badge,
        category: selectedOffer.category,
        claimCode: claimCode,
        timestamp: new Date().toISOString(),
      })
    );
    navigate('/claim');
  };

  const handleViewExistingReward = () => {
    const isClaimSubmitted = localStorage.getItem('mobile_hub_claim_submitted') === 'true';
    if (isClaimSubmitted) {
      navigate('/success');
    } else {
      navigate('/claim');
    }
  };

  const sessionId = customer?.id ? `MH-${8920 + customer.id}` : 'MH-9281';

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-space-xs pb-space-xl max-w-lg mx-auto">
      {/* Verification & Header Section */}
      <div className="flex flex-col items-center text-center gap-space-2xs mt-space-xs">
        {isVerifiedParticipant ? (
          <div className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-tertiary-fixed/40 text-on-tertiary-fixed-variant shadow-sm">
            <span
              className="material-symbols-outlined text-[16px] text-tertiary font-bold"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold text-tertiary">
              Verified Participant
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/verify')}
            className="inline-flex items-center gap-space-2xs px-space-sm py-1 rounded-full bg-primary-fixed text-primary shadow-sm hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] font-bold">lock</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
              Complete Social Verification to Unlock
            </span>
          </button>
        )}
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight mt-space-xs font-extrabold">
          {hasAlreadySpun ? 'Your Promotional Reward' : 'Your Reward Awaits'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[320px]">
          {hasAlreadySpun
            ? 'You have already completed your 1 promotional spin.'
            : 'Spin the wheel and see what you’ve won today.'}
        </p>
      </div>

      {/* Wheel Wrapper Container */}
      <div className="relative flex flex-col items-center justify-center my-space-md select-none">
        {/* Ambient Red Glow Depth */}
        <div className="absolute w-[290px] h-[290px] rounded-full bg-primary/10 blur-2xl pointer-events-none -z-10" />

        {/* 330px Signature Physical Wheel Unit */}
        <div className="relative w-[330px] h-[330px] flex items-center justify-center rounded-full shadow-[0_20px_36px_-8px_rgba(17,17,17,0.22),0_6px_14px_-2px_rgba(17,17,17,0.08)] bg-surface-container-lowest">
          {/* Outer Brushed Metallic / Chrome Layer Rim */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8E9094] via-[#FFFFFF] via-45% to-[#707276] p-[9px] shadow-inner">
            {/* Inner Secondary Bezel Ring with Subtle Concentric Channelling */}
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#D8D8D8] via-[#B4B6BA] to-[#ECECEC] p-[4px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)]">
              {/* Dark Rim Basin */}
              <div className="w-full h-full rounded-full bg-[#111111] p-[3px] shadow-[inset_0_3px_8px_rgba(0,0,0,0.6)]">
                {/* Rotating Wheel Face Disc (Exactly 6 Segments) */}
                <div
                  id="prizeWheelDisc"
                  className="w-full h-full rounded-full relative overflow-hidden bg-surface-container-lowest will-change-transform"
                  style={{
                    transform: `rotate(${rotationDeg}deg)`,
                    transition: isSpinning
                      ? 'transform 4800ms cubic-bezier(0.15, 0.9, 0.25, 1)'
                      : 'none',
                  }}
                >
                  <svg className="w-full h-full block" viewBox="0 0 400 400">
                    <defs>
                      {/* 3D Segment Depth Shading */}
                      <radialGradient cx="50%" cy="50%" fx="50%" id="segmentShade" r="50%">
                        <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
                        <stop offset="45%" stopColor="#000000" stopOpacity="0.05" />
                        <stop offset="90%" stopColor="#000000" stopOpacity="0" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                      </radialGradient>
                      {/* Premium Red Gradient */}
                      <linearGradient id="redSlice" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF242E" />
                        <stop offset="100%" stopColor="#B90014" />
                      </linearGradient>
                      {/* Crisp Pearl White Slice */}
                      <linearGradient id="whiteSlice" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#F2EFF0" />
                      </linearGradient>
                      {/* Metallic Chrome Outer Stud Profile */}
                      <radialGradient cx="35%" cy="30%" id="studGrad" r="70%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="45%" stopColor="#E1E1E1" />
                        <stop offset="85%" stopColor="#6F7075" />
                        <stop offset="100%" stopColor="#3A3A3D" />
                      </radialGradient>
                    </defs>

                    {/* Exactly 6 Segments (60 deg each, alternating red & white) */}
                    {/* Segment 0 (0°): Accessories (Red) */}
                    <g transform="rotate(0, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#redSlice)" />
                      <text fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800" textAnchor="middle" x="200" y="70">Accessories</text>
                      <text fill="#FFF9F8" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" opacity="0.95" textAnchor="middle" x="200" y="86">50% OFF</text>
                    </g>

                    {/* Segment 1 (60°): Mobiles (White) */}
                    <g transform="rotate(60, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#whiteSlice)" />
                      <text fill="#B90014" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800" textAnchor="middle" x="200" y="70">Mobiles</text>
                      <text fill="#5D3F3C" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" x="200" y="86">5% OFF</text>
                    </g>

                    {/* Segment 2 (120°): Neck Band (Red) */}
                    <g transform="rotate(120, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#redSlice)" />
                      <text fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800" textAnchor="middle" x="200" y="70">Neck Band</text>
                      <text fill="#FFF9F8" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" opacity="0.95" textAnchor="middle" x="200" y="86">@ ₹149/-</text>
                    </g>

                    {/* Segment 3 (180°): TWS Buds (White) */}
                    <g transform="rotate(180, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#whiteSlice)" />
                      <text fill="#B90014" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800" textAnchor="middle" x="200" y="70">TWS Buds</text>
                      <text fill="#5D3F3C" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" x="200" y="86">@ ₹399/-</text>
                    </g>

                    {/* Segment 4 (240°): Smart Watch (Red) */}
                    <g transform="rotate(240, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#redSlice)" />
                      <text fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="13" fontWeight="800" textAnchor="middle" x="200" y="70">Smart Watch</text>
                      <text fill="#FFF9F8" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" opacity="0.95" textAnchor="middle" x="200" y="86">@ ₹799/-</text>
                    </g>

                    {/* Segment 5 (300°): Glass Protection (White) */}
                    <g transform="rotate(300, 200, 200)">
                      <path d="M 200 200 L 100 26.795 A 200 200 0 0 1 300 26.795 Z" fill="url(#whiteSlice)" />
                      <text fill="#B90014" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="12" fontWeight="800" textAnchor="middle" x="200" y="70">Glass Protect</text>
                      <text fill="#5D3F3C" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.04em" textAnchor="middle" x="200" y="86">@ ₹49/-</text>
                    </g>

                    {/* Radial Shadow Filter for Concave Appearance */}
                    <circle cx="200" cy="200" fill="url(#segmentShade)" pointerEvents="none" r="200" />
                    {/* Perimeter Rings */}
                    <circle cx="200" cy="200" fill="none" r="197" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.5" />
                    <circle cx="200" cy="200" fill="none" r="192" stroke="#000000" strokeOpacity="0.25" strokeWidth="1" />

                    {/* 6 Structural Segment Dividers */}
                    <g opacity="0.7" stroke="#E8E8E8" strokeWidth="1.5">
                      <line x1="200" y1="200" x2="300" y2="26.795" />
                      <line x1="200" y1="200" x2="400" y2="200" />
                      <line x1="200" y1="200" x2="300" y2="373.205" />
                      <line x1="200" y1="200" x2="100" y2="373.205" />
                      <line x1="200" y1="200" x2="0" y2="200" />
                      <line x1="200" y1="200" x2="100" y2="26.795" />
                    </g>

                    {/* 6 Metallic Raised Perimeter Studs */}
                    <circle cx="300" cy="26.795" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                    <circle cx="400" cy="200" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                    <circle cx="300" cy="373.205" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                    <circle cx="100" cy="373.205" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                    <circle cx="0" cy="200" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                    <circle cx="100" cy="26.795" fill="url(#studGrad)" filter="drop-shadow(0 1px 1px rgba(0,0,0,0.5))" r="4.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Center Dimensional Chrome Hub & Tactile Red Spin Trigger */}
          <button
            type="button"
            id="centerSpinBtn"
            onClick={hasAlreadySpun ? handleViewExistingReward : triggerWheelSpin}
            disabled={isSpinning || isChecking}
            aria-label="Spin the wheel now"
            className="absolute z-20 w-[94px] h-[94px] rounded-full p-[4px] bg-gradient-to-tr from-[#9B9DA3] via-[#FFFFFF] to-[#7A7C80] shadow-[0_8px_18px_rgba(0,0,0,0.35),0_2px_4px_rgba(0,0,0,0.2)] active:scale-95 transition-transform cursor-pointer outline-none flex items-center justify-center disabled:opacity-85"
          >
            <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-b from-[#4A4B4E] to-[#202124]">
              <div
                className={`w-full h-full rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-2px_4px_rgba(0,0,0,0.5)] ${
                  hasAlreadySpun
                    ? 'bg-gradient-to-b from-surface-variant via-outline to-on-surface'
                    : 'bg-gradient-to-b from-primary-container via-primary to-[#8A000D]'
                }`}
              >
                <span className="font-headline-sm text-label-sm font-extrabold uppercase tracking-wider text-on-primary text-center leading-none">
                  {isChecking ? '...' : isSpinning ? '...' : hasAlreadySpun ? 'USED' : 'SPIN'}
                </span>
                <span className="font-label-sm text-[9px] font-bold uppercase tracking-widest text-on-primary-container opacity-90 leading-tight">
                  {hasAlreadySpun ? 'LIMIT' : 'NOW'}
                </span>
              </div>
            </div>
          </button>

          {/* Realistic Top Downward Chrome/Red Indicator Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.38)]">
            <svg fill="none" height="42" viewBox="0 0 34 42" width="34">
              <ellipse cx="17" cy="8" fill="#D3D5D9" rx="8" ry="6" />
              <ellipse cx="17" cy="7" fill="#FFFFFF" rx="6" ry="4.5" />
              <circle cx="17" cy="6.5" fill="#5F6166" r="2.5" />
              <path d="M 9 7 L 25 7 L 19.5 35 C 18.5 39 15.5 39 14.5 35 Z" fill="url(#pointerRed)" />
              <path d="M 17 7 L 25 7 L 19.5 35 C 18.5 39 17 38.5 17 35 Z" fill="#000000" fillOpacity="0.18" />
              <path d="M 10.5 8 L 15.5 8 L 14.5 32 Z" fill="#FFFFFF" fillOpacity="0.32" />
              <defs>
                <linearGradient id="pointerRed" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF3842" />
                  <stop offset="50%" stopColor="#E31B23" />
                  <stop offset="100%" stopColor="#8F000D" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STATE A: IF ALREADY SPUN -> CLEAN "SPIN ALREADY USED" CARD */}
      {/* ======================================================== */}
      {hasAlreadySpun ? (
        <div className="w-full rounded-2xl bg-surface-container-lowest border-2 border-primary/25 p-space-lg shadow-md flex flex-col items-center text-center gap-space-sm animate-in fade-in duration-300 mt-space-xs">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lock
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-primary-fixed/50 text-primary font-bold text-label-sm uppercase tracking-wider">
            <span>One User = One Spin Only</span>
          </div>

          <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold">
            Spin Already Used
          </h2>

          <p className="font-body-sm text-body-sm text-secondary max-w-sm">
            {spinErrorMsg ||
              'This mobile number has already participated in the MobileHub reward campaign. Strictly 1 promotional spin is allowed per verified participant.'}
          </p>

          {/* Winning Details Recap Card */}
          {(selectedOffer || existingSpinData) && (
            <div className="w-full bg-surface-container-low rounded-xl p-space-md flex items-center justify-between border border-surface-container text-left my-space-xs">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-label-md">
                  {selectedOffer?.badge?.includes('OFF') ? '%' : '₹'}
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-bold">
                    {selectedOffer?.offer || existingSpinData?.prize_name || existingSpinData?.prizeName || 'Promotional Reward'}
                  </div>
                  <div className="font-mono text-body-sm text-secondary">
                    Claim Code: <span className="font-bold text-on-surface">{claimCode || existingSpinData?.claim_code || 'MHUB-PROMO'}</span>
                  </div>
                </div>
              </div>
              <span className="font-label-sm text-label-sm font-bold text-tertiary bg-tertiary-fixed/30 px-2.5 py-1 rounded-full">
                ACTIVE
              </span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col gap-space-xs w-full mt-space-2xs">
            <button
              type="button"
              id="viewMyRewardBtn"
              onClick={handleViewExistingReward}
              className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-md hover:bg-primary-container active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
              <span>View My Reward / Claim Details</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Back to MobileHub Home</span>
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* STATE B: FRESH ELIGIBLE USER -> SPIN TRIGGER CONTROLS    */
        /* ======================================================== */
        <div className="flex flex-col items-center gap-space-xs mt-space-2xs w-full">
          {spinErrorMsg && (
            <div className="w-full p-space-sm rounded-xl bg-error-container/40 text-error border border-error/20 text-body-sm text-center font-medium">
              {spinErrorMsg}
            </div>
          )}

          {/* Status & Spin Allowance Card */}
          <div className="w-full flex items-center justify-between px-space-md py-space-sm rounded-xl bg-surface-container-low shadow-sm border border-surface-container/60">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">motion_photos_on</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface font-bold">
                  {isChecking
                    ? 'Verifying Concurrency...'
                    : isSpinning
                    ? 'Spinning In Progress...'
                    : '1 Free Spin Available'}
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Session #{sessionId} • 6 Exclusive Offers
                </span>
              </div>
            </div>
            <span
              className={`font-label-sm text-label-sm font-bold px-space-xs py-1 rounded uppercase ${
                isSpinning || isChecking
                  ? 'text-primary bg-primary-fixed/50 animate-pulse'
                  : 'text-tertiary bg-tertiary-fixed/30'
              }`}
            >
              {isChecking ? 'Checking' : isSpinning ? 'Rolling' : 'Ready'}
            </span>
          </div>

          {/* Main Full-Width Spin Button */}
          {!isVerifiedParticipant ? (
            <button
              type="button"
              id="mainSpinBtn"
              onClick={() => navigate('/verify')}
              className="w-full h-12 mt-space-2xs rounded-xl bg-inverse-surface text-inverse-on-surface font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] hover:opacity-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Complete Social Verification to Unlock</span>
            </button>
          ) : (
            <button
              type="button"
              id="mainSpinBtn"
              onClick={triggerWheelSpin}
              disabled={isSpinning || isChecking}
              className={`w-full h-12 mt-space-2xs rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-[0_4px_14px_rgba(227,27,35,0.35)] active:scale-[0.98] hover:bg-primary-container transition-all cursor-pointer ${
                isSpinning || isChecking ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isSpinning || isChecking ? 'animate-spin' : ''
                }`}
              >
                rotate_right
              </span>
              <span>
                {isChecking
                  ? 'Verifying Concurrency...'
                  : isSpinning
                  ? 'Spinning Wheel...'
                  : 'Spin The Wheel'}
              </span>
            </button>
          )}

          <p className="font-body-sm text-body-sm text-secondary text-center max-w-[320px] mt-space-2xs">
            Good luck! Each spin is 100% genuine and physically synchronized with the pointer.
          </p>
        </div>
      )}

      {/* Winning Offer Popup / Modal */}
      {showModal && selectedOffer && (
        <div
          id="winnerModal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm px-margin-mobile animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-space-lg shadow-[0_20px_32px_-8px_rgba(17,17,17,0.25)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200 border border-surface-container">
            {/* Trophy Emblem */}
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-space-sm shadow-inner">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                military_tech
              </span>
            </div>

            {/* Official Winner Pill */}
            <div className="inline-flex items-center gap-1 px-space-xs py-0.5 rounded-full bg-tertiary-fixed/40 text-tertiary mb-space-2xs font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span className="font-label-sm text-label-sm uppercase">Official Winner</span>
            </div>

            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold mt-space-2xs">
              {selectedOffer.popupTitle}
            </h2>

            <p className="font-headline-sm text-headline-sm text-primary font-bold mt-space-2xs mb-space-md">
              {selectedOffer.popupOffer}
            </p>

            {/* Offer Details Card Preview */}
            <div className="w-full bg-surface-container-low rounded-xl p-space-md flex items-center justify-between mb-space-lg shadow-sm border border-surface-container/60 text-left">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                  {selectedOffer.badge.includes('OFF') ? '%' : '₹'}
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-bold">
                    {selectedOffer.category}
                  </div>
                  <div className="font-body-sm text-body-sm text-secondary">
                    Claim Code: <span className="font-mono font-bold text-on-surface">{claimCode}</span>
                  </div>
                </div>
              </div>
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                {selectedOffer.badge}
              </span>
            </div>

            {/* Action Button: Directly Navigates to Dedicated /claim Full Page */}
            <div className="flex flex-col gap-space-xs w-full">
              <button
                type="button"
                id="claimRewardNowBtn"
                onClick={handleClaimOffer}
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] hover:bg-primary-container transition-all cursor-pointer"
              >
                <span>Claim Offer Now</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
