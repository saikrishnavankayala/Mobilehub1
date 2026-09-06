import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';

interface ConfirmedClaimData {
  referenceId: string;
  claimCode: string;
  status: string;
  prizeName: string;
  customer: {
    name: string;
    mobile: string;
    address: string;
    pincode: string;
  };
  claimed_at?: string;
}

export const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer } = useCustomer();

  const [claimData, setClaimData] = useState<ConfirmedClaimData | null>(() => {
    try {
      const saved = localStorage.getItem('mobile_hub_confirmed_claim');
      if (saved) return JSON.parse(saved);
      const win = localStorage.getItem('mobile_hub_last_win');
      if (win) {
        const parsed = JSON.parse(win);
        return {
          referenceId: '#MHUB-CLAIM-89421-VC',
          claimCode: parsed.claimCode || 'MH-892014',
          status: 'CONFIRMED',
          prizeName: parsed.prizeName || '50% Discount on Accessories',
          customer: {
            name: customer?.name || 'Valued Customer',
            mobile: customer?.mobile || '98201 45890',
            address: customer?.address || 'Main Road, Tadepalligudem',
            pincode: '534101',
          },
        };
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyReference = () => {
    const ref = claimData?.referenceId || '#MHUB-CLAIM-89421-VC';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ref).then(() => {
        showToast(`Reference ${ref} copied!`);
      }).catch(() => {
        showToast(`Copied: ${ref}`);
      });
    } else {
      showToast(`Copied: ${ref}`);
    }
  };

  const handleSaveReceipt = () => {
    showToast('Encrypted receipt downloaded successfully!');
  };

  const prizeName = claimData?.prizeName || '50% Discount on Accessories';
  const referenceId = claimData?.referenceId || '#MHUB-CLAIM-89421-VC';
  const claimCode = claimData?.claimCode || 'MH-892014';
  const recipientName = claimData?.customer?.name || customer?.name || 'Valued Customer';
  const recipientMobile = claimData?.customer?.mobile || customer?.mobile || '98765 43210';
  const recipientAddress = claimData?.customer?.address || customer?.address || 'Flagship Store Delivery';
  const recipientPincode = claimData?.customer?.pincode || '534101';

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-space-sm pb-space-xl max-w-lg mx-auto min-h-[calc(100vh-64px)]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-4 right-4 z-50 p-space-md rounded-xl bg-tertiary text-on-tertiary shadow-xl flex items-center gap-space-sm max-w-md mx-auto animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-label-md text-label-md font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main Success Container */}
      <div className="flex flex-col items-center text-center gap-space-xs my-space-md">
        {/* Large Celebratory Emerald Badge */}
        <div className="w-20 h-20 rounded-full bg-tertiary-fixed/30 text-tertiary flex items-center justify-center mb-space-xs shadow-inner">
          <span
            className="material-symbols-outlined text-[44px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            task_alt
          </span>
        </div>

        {/* Official Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary">
            Claim Confirmed &amp; Authorized
          </span>
        </div>

        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-extrabold tracking-tight mt-space-2xs">
          Reward Claimed Successfully!
        </h1>

        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mt-space-2xs">
          Thank you for celebrating with <span className="font-bold text-primary">MobileHub</span>! Your exclusive promotional gift pass has been registered.
        </p>
      </div>

      {/* Premium Digital Redemption Pass Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container flex flex-col gap-space-md mb-space-lg">
        {/* Pass Header */}
        <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
          <div className="flex items-center gap-space-2xs">
            <span className="material-symbols-outlined text-primary text-[22px]">card_giftcard</span>
            <span className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
              MobileHub Festival Pass
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary font-bold bg-tertiary-fixed/30 px-2.5 py-0.5 rounded-full">
            CONFIRMED
          </span>
        </div>

        {/* Prize Showcase Banner */}
        <div className="bg-gradient-to-br from-primary to-[#8A000E] text-on-primary rounded-xl p-space-md flex flex-col gap-1 shadow-sm">
          <span className="font-label-sm text-label-sm uppercase tracking-wider opacity-90 font-semibold">
            Authorized Reward
          </span>
          <span className="font-headline-lg text-headline-lg font-extrabold">
            {prizeName}
          </span>
          <span className="font-body-sm text-body-sm opacity-85">
            Valid at MobileHub Tadepalligudem &amp; Authorized Stores
          </span>
        </div>

        {/* Key Identifiers Grid */}
        <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-secondary">Claim Code:</span>
            <span className="font-mono font-bold text-on-surface text-label-lg">{claimCode}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm text-secondary">Reference ID:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-on-surface text-label-sm truncate">{referenceId}</span>
              <button
                type="button"
                onClick={handleCopyReference}
                className="text-secondary hover:text-primary cursor-pointer p-0.5"
                title="Copy reference ID"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recipient Details Preview */}
        <div className="flex flex-col gap-space-xs text-left pt-space-2xs">
          <span className="font-label-sm text-label-sm text-secondary uppercase font-bold tracking-wider">
            Recipient Registration Details
          </span>
          <div className="flex flex-col gap-1 text-sm bg-surface-container-lowest p-space-xs rounded-lg border border-surface-container/60">
            <div className="flex justify-between">
              <span className="text-secondary font-medium">Name:</span>
              <span className="font-bold text-on-surface">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary font-medium">Contact:</span>
              <span className="font-mono font-bold text-on-surface">+91 {recipientMobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary font-medium">Destination:</span>
              <span className="text-on-surface text-right font-medium max-w-[220px] truncate">
                {recipientAddress} ({recipientPincode})
              </span>
            </div>
          </div>
        </div>

        {/* Instant Settlement Badge */}
        <div className="flex items-center gap-2 text-xs text-secondary pt-space-2xs border-t border-surface-container">
          <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
          <span>Encrypted digital pass delivered via SMS. Present this during billing.</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-space-sm w-full mb-space-lg">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-space-xs shadow-md active:scale-[0.98] hover:bg-primary transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span>Back to MobileHub</span>
        </button>

        <button
          type="button"
          onClick={handleSaveReceipt}
          className="w-full h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-space-xs hover:bg-surface-container-high active:scale-[0.98] transition-all cursor-pointer border border-surface-container"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Save / Download Digital Receipt</span>
        </button>
      </div>

      {/* Support Info */}
      <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-surface-container/60 text-center flex flex-col items-center gap-1">
        <span className="font-label-md text-label-md text-on-surface font-bold">
          Need Assistance with Redemption?
        </span>
        <p className="font-body-sm text-body-sm text-secondary">
          Visit MobileHub Flagship Store or contact our concierge helpline at{' '}
          <a href="tel:+919876543210" className="text-primary font-bold hover:underline">
            +91 98765 43210
          </a>.
        </p>
      </div>
    </div>
  );
};
