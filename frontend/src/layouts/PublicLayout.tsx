import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { useCustomer } from '../context/CustomerContext';
import { CustomerEntryModal } from '../components/customer/CustomerEntryModal';

export const PublicLayout: React.FC = () => {
  const { campaign } = useCustomer();
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [entryModalOpen, setEntryModalOpen] = useState(false);


  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      {/* Fixed Header */}
      <Navbar onOpenRegister={() => setEntryModalOpen(true)} />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-0 bg-surface">
        <Outlet />
        <Footer onOpenTerms={() => setTermsOpen(true)} onOpenPrivacy={() => setPrivacyOpen(true)} />
      </main>

      {/* Global Terms Modal */}
      {termsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-margin-mobile">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Terms &amp; Conditions</h3>
              <button
                onClick={() => setTermsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto py-space-md flex flex-col gap-space-sm font-body-sm text-body-sm text-secondary leading-relaxed">
              <p>1. <strong>Eligibility:</strong> The MobileHub Rewards Campaign 2026 is open to verified participants with valid Indian telecommunications registration.</p>
              <p>2. <strong>Spin Allowance:</strong> Strictly 1 authenticated spin per verified mobile phone number across the promotional season.</p>
              <p>3. <strong>Voucher Validity:</strong> Reward passes must be confirmed within 15 minutes of initial generation. Unclaimed amounts are recycled to the active daily prize pool.</p>
              <p>4. <strong>Fulfillment:</strong> Codes are distributed via encrypted SMS and linked to recipient verification records. No commercial exchange or cash alternative is available.</p>
              <p>5. <strong>Data Privacy:</strong> Identity and residency records are strictly used for delivery coordination and statutory tax conformity.</p>
              {campaign?.terms_conditions && (
                <div className="pt-2 border-t border-surface-container text-xs text-secondary whitespace-pre-line">
                  {campaign.terms_conditions}
                </div>
              )}
            </div>
            <div className="pt-space-sm border-t border-surface-container">
              <button
                type="button"
                onClick={() => setTermsOpen(false)}
                className="w-full h-11 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm"
              >
                Understood &amp; Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Privacy Modal */}
      {privacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-margin-mobile">
          <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-space-lg flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Privacy Policy</h3>
              <button
                onClick={() => setPrivacyOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="overflow-y-auto py-space-md flex flex-col gap-space-sm font-body-sm text-body-sm text-secondary leading-relaxed">
              <p>MobileHub values your privacy. We collect customer mobile numbers and delivery address data exclusively to verify campaign participation eligibility, safeguard concurrency allocations, and fulfill winning prize shipments.</p>
              <p>We do not sell, license, or monetize your contact records. All SMS transmissions utilize 256-bit high-grade carrier encryption.</p>
              {campaign?.privacy_policy && (
                <div className="pt-2 border-t border-surface-container text-xs text-secondary whitespace-pre-line">
                  {campaign.privacy_policy}
                </div>
              )}
            </div>
            <div className="pt-space-sm border-t border-surface-container">
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                className="w-full h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Identification & Login Modal */}
      <CustomerEntryModal
        isOpen={entryModalOpen}
        onClose={() => setEntryModalOpen(false)}
      />
    </div>
  );
};

