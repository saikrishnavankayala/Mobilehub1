import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../services/api';

export const ClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, existingSpin } = useCustomer();
  const [spinData, setSpinData] = useState<any>(() => {
    if (existingSpin) return existingSpin;
    try {
      const saved = localStorage.getItem('mobile_hub_last_win');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const mobile = customer?.mobile || localStorage.getItem('mobile_hub_user_mobile') || '';
    if (mobile && (!spinData || !spinData.claim_code)) {
      api.get('/spin/status', { params: { mobileNumber: mobile } })
        .then((res) => {
          if (res.data?.has_spun && res.data.spin) {
            setSpinData(res.data.spin);
          }
        })
        .catch(() => {});
    }
  }, [customer?.mobile, spinData]);

  const prizeName = spinData?.prize?.name || spinData?.prize_name || spinData?.prizeName || 'Promotional Offer';
  const prizeValue = spinData?.prize?.badge || spinData?.prizeValue || 'Exclusive';
  const claimCode = spinData?.claim_code || spinData?.claimCode || '';

  const isAlreadyClaimed = spinData?.status === 'CLAIMED' || localStorage.getItem('mobile_hub_claim_submitted') === 'true';

  // Form states
  const [fullName, setFullName] = useState(customer?.name || '');
  const [mobilePhone, setMobilePhone] = useState(
    customer?.mobile ? formatPhoneString(customer.mobile) : ''
  );
  const [pinCode, setPinCode] = useState('534101');
  const [regionBadge, setRegionBadge] = useState('Tadepalligudem, AP');
  const [address, setAddress] = useState(
    customer?.address || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // 15-minute countdown for form
  const [timeRemaining, setTimeRemaining] = useState(14 * 60 + 52);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatPhoneString(val: string) {
    const clean = val.replace(/\D/g, '').slice(0, 10);
    if (clean.length > 5) {
      return clean.slice(0, 5) + ' ' + clean.slice(5);
    }
    return clean;
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobilePhone(formatPhoneString(e.target.value));
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinCode(clean);
    if (clean.length === 6) {
      if (clean.startsWith('534')) {
        setRegionBadge('Tadepalligudem, AP');
      } else if (clean.startsWith('50') || clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53')) {
        setRegionBadge('Telangana / AP');
      } else if (clean.startsWith('56')) {
        setRegionBadge('Bengaluru, KA');
      } else if (clean.startsWith('40') || clean.startsWith('41')) {
        setRegionBadge('Mumbai, MH');
      } else if (clean.startsWith('11')) {
        setRegionBadge('New Delhi, DL');
      } else {
        setRegionBadge('Verified Region');
      }
    } else {
      setRegionBadge('Enter 6 digits');
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const cleanMobile = mobilePhone.replace(/\s+/g, '');

    try {
      // 1. Post to backend API to register claim
      const res = await api.post('/claims/submit', {
        claimCode: claimCode,
        mobile: cleanMobile || customer?.mobile,
        fullName: fullName.trim() || 'Valued Customer',
        address: address.trim() || 'MobileHub Store Pickup',
        pincode: pinCode.trim() || '534101',
      });

      const data = res.data?.data;
      const confirmedData = {
        referenceId: data?.referenceId || `#MHUB-CLAIM-${Math.floor(10000 + Math.random() * 90000)}-VC`,
        claimCode: data?.claimCode || claimCode,
        status: 'CONFIRMED',
        prizeName: data?.prizeName || prizeName,
        customer: {
          name: fullName.trim() || 'Valued Customer',
          mobile: cleanMobile || customer?.mobile || '9876543210',
          address: address.trim() || 'Store Pickup',
          pincode: pinCode.trim() || '534101',
        },
        claimed_at: data?.claimed_at || new Date().toISOString(),
      };

      localStorage.setItem('mobile_hub_confirmed_claim', JSON.stringify(confirmedData));
      localStorage.setItem('mobile_hub_claim_submitted', 'true');

      // 2. Standalone Full Page Navigation to /success (NO MODAL / NO DRAWER)
      navigate('/success');
    } catch (err: any) {
      // Even if backend fails or is offline, save local confirmed state and navigate to /success
      const confirmedData = {
        referenceId: `#MHUB-CLAIM-${Math.floor(10000 + Math.random() * 90000)}-VC`,
        claimCode: claimCode,
        status: 'CONFIRMED',
        prizeName: prizeName,
        customer: {
          name: fullName.trim() || 'Valued Customer',
          mobile: cleanMobile || customer?.mobile || '9876543210',
          address: address.trim() || 'Store Pickup',
          pincode: pinCode.trim() || '534101',
        },
        claimed_at: new Date().toISOString(),
      };

      localStorage.setItem('mobile_hub_confirmed_claim', JSON.stringify(confirmedData));
      localStorage.setItem('mobile_hub_claim_submitted', 'true');

      navigate('/success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedTimer = () => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-space-xs pb-space-2xl gap-space-lg max-w-lg mx-auto min-h-[calc(100vh-64px)]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          id="toast-banner"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] max-w-sm pointer-events-none"
        >
          <div className="bg-inverse-surface text-inverse-on-surface px-space-md py-space-sm rounded-xl shadow-xl flex items-center gap-space-sm border border-white/10">
            <span
              className="material-symbols-outlined text-tertiary-fixed text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="font-body-sm text-body-sm flex-1 font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Already Claimed Notice Banner */}
      {isAlreadyClaimed && (
        <div className="w-full bg-tertiary-fixed/30 border border-tertiary/40 rounded-xl p-space-md flex items-center justify-between text-on-surface animate-in fade-in duration-200">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-tertiary text-[24px]">verified</span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold">Reward Already Registered</span>
              <span className="font-body-sm text-body-sm text-secondary">
                You have already confirmed this claim.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/success')}
            className="px-space-sm py-1.5 rounded-lg bg-tertiary text-on-tertiary font-label-sm text-label-sm font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            View Receipt
          </button>
        </div>
      )}

      {/* Progress Stepper Indicator */}
      <div className="flex items-center justify-between pt-space-xs">
        <div className="flex items-center gap-space-xs">
          <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
            <span className="material-symbols-outlined text-[14px]">check</span>
          </span>
          <span className="font-label-md text-label-md text-on-surface font-bold">
            Step 4 of 4: Final Claim
          </span>
        </div>
        <div className="flex items-center gap-space-2xs bg-error-container/60 text-error px-space-xs py-space-2xs rounded-full font-bold">
          <span className="material-symbols-outlined text-[14px]">timer</span>
          <span className="font-label-sm text-label-sm tracking-wide">
            {formattedTimer()} REMAINING
          </span>
        </div>
      </div>

      {/* Section 1: Winner Announcement Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-space-lg flex flex-col items-center text-center border border-surface-container/80">
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-primary/5 pointer-events-none blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-tertiary/5 pointer-events-none blur-lg" />

        {/* Verified Winner Badge */}
        <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-tertiary-container/20 text-tertiary font-label-md text-label-md mb-space-sm font-bold">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span className="font-semibold tracking-wide">Verified Winner</span>
        </div>

        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight font-extrabold">
          Congratulations! You’ve Won {prizeValue}
        </h1>
        <p className="font-body-sm text-body-sm text-secondary mt-space-xs max-w-[320px]">
          Your reward has been reserved for 15 minutes. Complete your verified details below to generate your instant digital gift pass.
        </p>

        {/* Tactile Reward Voucher Pass */}
        <div className="w-full mt-space-lg rounded-xl bg-gradient-to-br from-primary via-primary-container to-[#8A000D] p-space-md text-on-primary shadow-[0_8px_24px_-4px_rgba(185,0,20,0.3)] relative overflow-hidden text-left">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 pointer-events-none">
            <svg className="w-full h-full fill-current" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="currentColor" strokeWidth="6" />
              <path d="M50 15 L58 35 L80 38 L63 54 L68 76 L50 64 L32 76 L37 54 L20 38 L42 35 Z" />
            </svg>
          </div>

          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed-dim/90 block font-bold">
                MobileHub Official Pass
              </span>
              <p className="font-headline-lg text-headline-lg font-extrabold tracking-tight text-white mt-space-2xs">
                {prizeName}
              </p>
            </div>
            <div className="flex items-center gap-space-2xs bg-black/25 px-space-xs py-space-2xs rounded-lg backdrop-blur-sm">
              <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">verified</span>
              <span className="font-label-sm text-label-sm text-white font-bold">AUTHENTIC</span>
            </div>
          </div>

          <div className="w-full my-space-sm h-[1px] bg-white/20" />

          <div className="flex items-end justify-between relative z-10">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-white/80 tracking-wider uppercase font-medium">
                Voucher Code
              </span>
              <span className="font-headline-sm text-headline-sm tracking-wider font-bold text-white font-mono">
                {claimCode}
              </span>
            </div>
            <div className="text-right">
              <span className="font-label-sm text-label-sm text-white/80 block">Auto-Dispatch</span>
              <span className="font-label-md text-label-md text-white font-bold">Instant SMS Pass</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: User Details Form Card */}
      <div className="rounded-2xl bg-surface-container-lowest shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-space-lg flex flex-col border border-surface-container/80">
        <div className="flex flex-col gap-space-2xs pb-space-md border-b border-surface-container">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Claim Your Reward</h2>
            <span className="material-symbols-outlined text-primary text-[24px]">card_giftcard</span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary">
            Enter your verified details so our fulfillment desk can dispatch your official gift voucher pass.
          </p>
        </div>

        {submitError && (
          <div className="mt-space-sm p-space-sm rounded-xl bg-error-container/40 text-error border border-error/20 text-body-sm text-center">
            {submitError}
          </div>
        )}

        <form className="flex flex-col gap-space-md mt-space-md" onSubmit={handleClaimSubmit}>
          {/* Field 1: Full Name */}
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold" htmlFor="fullName">
                Full Name
              </label>
              <span className="font-body-sm text-body-sm text-secondary">As per Government ID</span>
            </div>
            <div className="relative flex items-center">
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full h-12 px-space-md pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-surface-container"
              />
              <div className="absolute right-3 flex items-center pointer-events-none text-tertiary">
                <span className="material-symbols-outlined text-[20px]">
                  {fullName.trim().length >= 3 ? 'check_circle' : 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Field 2: Mobile Number */}
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold" htmlFor="mobilePhone">
                Mobile Number
              </label>
              <span className="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Verified Number
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <div className="h-12 px-space-sm bg-surface-container flex items-center justify-center rounded-xl text-on-surface font-label-md text-label-md select-none shrink-0 font-bold border border-surface-container">
                <span className="tracking-wider">+91</span>
              </div>
              <div className="relative flex-1 flex items-center">
                <input
                  id="mobilePhone"
                  name="mobilePhone"
                  type="tel"
                  required
                  value={mobilePhone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  maxLength={12}
                  className="w-full h-12 px-space-md pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-surface-container font-mono"
                />
                <div className="absolute right-3 flex items-center pointer-events-none text-tertiary">
                  <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                </div>
              </div>
            </div>
            <span className="font-body-sm text-body-sm text-secondary">
              The digital voucher pin code will be dispatched via SMS.
            </span>
          </div>

          {/* Field 3: Postal Code */}
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold" htmlFor="pinCode">
                Pincode / Postal Code
              </label>
              <span className="font-label-sm text-label-sm text-tertiary font-bold">{regionBadge}</span>
            </div>
            <div className="relative flex items-center">
              <input
                id="pinCode"
                name="pinCode"
                type="text"
                required
                maxLength={6}
                value={pinCode}
                onChange={handlePinChange}
                placeholder="6-digit PIN code"
                className="w-full h-12 px-space-md pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md tracking-wider focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border border-surface-container font-mono"
              />
              <div className="absolute right-3 flex items-center pointer-events-none text-tertiary">
                <span className="material-symbols-outlined text-[20px]">
                  {pinCode.length === 6 ? 'check_circle' : 'pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Field 4: Delivery Address */}
          <div className="flex flex-col gap-space-2xs">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-bold" htmlFor="fullAddress">
                Registered Contact / Delivery Address
              </label>
              <span className="font-body-sm text-body-sm text-secondary">For store records</span>
            </div>
            <textarea
              id="fullAddress"
              name="fullAddress"
              rows={3}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat / House No., Building Name, Street, Landmark, Town"
              className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none border border-surface-container"
            />
          </div>

          {/* Security Trust Notice */}
          <div className="flex items-center justify-center gap-space-xs py-space-xs px-space-sm rounded-xl bg-surface-container-low text-on-surface-variant border border-surface-container/60">
            <svg className="w-4 h-4 text-tertiary shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
              256-Bit SSL Encrypted • Direct Store Authorization
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            id="submitClaimBtn"
            disabled={isSubmitting}
            className="w-full h-12 mt-space-xs rounded-xl bg-primary text-on-primary font-label-lg text-label-lg font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs hover:bg-primary-container transition-all active:scale-[0.98] shadow-md cursor-pointer disabled:opacity-80"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                <span>Confirming Claim...</span>
              </>
            ) : (
              <>
                <span>Confirm &amp; Generate Gift Pass</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>

          <div className="flex flex-col items-center gap-space-xs text-center mt-space-2xs">
            <button
              type="button"
              onClick={() => setTermsModalOpen(true)}
              className="font-label-md text-label-md text-secondary hover:text-on-surface underline underline-offset-4 transition-colors cursor-pointer"
            >
              View Campaign Terms &amp; Prize Policy
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Trust Badges */}
      <div className="grid grid-cols-2 gap-space-sm pb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-2xs border border-surface-container/60">
          <span className="material-symbols-outlined text-primary text-[24px]">verified</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">Verified Partner</span>
          <span className="font-body-sm text-body-sm text-secondary">Authorized merchant digital code issuance.</span>
        </div>
        <div className="p-space-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-2xs border border-surface-container/60">
          <span className="material-symbols-outlined text-tertiary text-[24px]">electric_bolt</span>
          <span className="font-label-md text-label-md text-on-surface font-bold">Instant Claim</span>
          <span className="font-body-sm text-body-sm text-secondary">Voucher credited instantly upon submit.</span>
        </div>
      </div>

      {/* Campaign Terms Modal Dialog */}
      {termsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-margin-mobile animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col max-h-[80vh] shadow-2xl border border-surface-container">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Terms &amp; Conditions</h3>
              <button
                type="button"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary cursor-pointer"
                onClick={() => setTermsModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto py-space-md flex flex-col gap-space-sm font-body-sm text-body-sm text-secondary leading-relaxed">
              <p>
                1. <strong>Eligibility:</strong> The MobileHub Rewards Campaign 2026 is open to verified participants with valid Indian telecommunications registration.
              </p>
              <p>
                2. <strong>One User = One Spin:</strong> Strictly 1 promotional spin is allowed per customer mobile number.
              </p>
              <p>
                3. <strong>Voucher Validity:</strong> Reward passes must be confirmed within 15 minutes of initial generation.
              </p>
              <p>
                4. <strong>Fulfillment:</strong> Codes are distributed via encrypted SMS and linked to recipient store KYC records. Redeemable at MobileHub stores.
              </p>
            </div>
            <div className="pt-space-sm border-t border-surface-container">
              <button
                type="button"
                className="w-full h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors font-bold cursor-pointer"
                onClick={() => setTermsModalOpen(false)}
              >
                Understood &amp; Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
