import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomer } from '../../context/CustomerContext';
import mobileHubLogo from '../../assets/mobile-hub-logo.png';

interface NavbarProps {
  onOpenRegister?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRegister }) => {
  const { customer, logout } = useCustomer();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    if (customer) {
      setProfileModalOpen(true);
    } else if (onOpenRegister) {
      onOpenRegister();
    } else {
      navigate('/verify');
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/50">
        <div className="h-16 px-margin-mobile max-w-5xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link to="/" className="flex items-center gap-space-xs sm:gap-space-sm active:scale-98 transition-transform">
            <img
              alt="Mobile Hub"
              className="h-8 sm:h-9 w-auto object-contain rounded"
              src={mobileHubLogo}
            />
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface uppercase font-bold">
              MobileHub
            </span>
            <span className="hidden sm:inline-flex items-center px-space-xs py-space-2xs rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm uppercase tracking-wider font-bold">
              Rewards 2026
            </span>
          </Link>


          {/* Action Buttons */}
          <div className="flex items-center gap-space-xs">
            {/* User Profile Avatar */}
            <button
              onClick={handleProfileClick}
              type="button"
              aria-label="User Profile"
              className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
              title={customer ? `${customer.name} (+91 ${customer.mobile})` : 'Join / Sign In'}
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">
                {customer ? 'check' : 'person'}
              </span>
            </button>

            {/* Menu Drawer Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
              aria-label="Menu"
              className="w-11 h-11 flex items-center justify-center rounded-lg text-on-surface hover:bg-surface-container active:scale-95 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">
                {menuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-xs bg-surface-container-lowest h-full shadow-2xl pt-20 pb-8 px-space-lg flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-space-md">
              <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
                <div className="flex items-center gap-space-xs">
                  <img
                    alt="Mobile Hub"
                    className="h-8 w-auto object-contain rounded"
                    src={mobileHubLogo}
                  />
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm font-bold text-on-surface">MobileHub</span>
                    <span className="font-label-sm text-label-sm text-secondary">Promotional Portal 2026</span>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1 text-on-surface">
                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-space-sm py-2.5 px-space-sm rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                  <span>1. Discover & Catalog</span>
                </Link>
                <Link
                  to="/verify"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-space-sm py-2.5 px-space-sm rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
                  <span>2. Social Verification</span>
                </Link>
                <Link
                  to="/spin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-space-sm py-2.5 px-space-sm rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">rotate_right</span>
                  <span>3. Spin The Wheel</span>
                </Link>
                <Link
                  to="/claim"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-space-sm py-2.5 px-space-sm rounded-lg hover:bg-surface-container font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">redeem</span>
                  <span>4. Claim Voucher & Receipt</span>
                </Link>
              </div>

              {/* Admin Portal Link */}
              <div className="pt-space-sm border-t border-surface-container">
                <Link
                  to="/admin/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-2 px-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-label-md text-label-md"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">admin_panel_settings</span>
                    <span>Admin Portal</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">chevron_right</span>
                </Link>
              </div>
            </div>

            {/* User Session Footer inside Menu */}
            <div className="pt-space-md border-t border-surface-container flex flex-col gap-space-sm">
              {customer ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                    <span className="font-label-sm text-label-sm text-on-surface font-bold truncate">
                      {customer.name} (+91 {customer.mobile})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    type="button"
                    className="w-full py-2 rounded-lg bg-error-container text-error font-label-sm text-label-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    if (onOpenRegister) onOpenRegister();
                    else navigate('/verify');
                  }}
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Register to Play</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Profile Quick Modal */}
      {profileModalOpen && customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-margin-mobile">
          <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl flex flex-col gap-space-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Participant Status</h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
                <span className="font-label-sm text-label-sm text-secondary">Name:</span>
                <span className="font-label-md text-label-md font-bold text-on-surface">{customer.name}</span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
                <span className="font-label-sm text-label-sm text-secondary">Mobile:</span>
                <span className="font-label-md text-label-md font-mono text-on-surface">+91 {customer.mobile}</span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
                <span className="font-label-sm text-label-sm text-secondary">OTP Status:</span>
                <span className="font-label-sm text-label-sm text-tertiary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-space-sm bg-surface-container-low rounded-xl">
                <span className="font-label-sm text-label-sm text-secondary">Social Gate:</span>
                <span className={`font-label-sm text-label-sm font-bold flex items-center gap-1 ${customer.social_verified ? 'text-tertiary' : 'text-primary'}`}>
                  <span className="material-symbols-outlined text-[16px]">{customer.social_verified ? 'check_circle' : 'pending'}</span>
                  {customer.social_verified ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="flex gap-space-xs pt-space-xs">
              <button
                onClick={() => {
                  setProfileModalOpen(false);
                  logout();
                }}
                className="flex-1 py-2 rounded-xl bg-surface-container text-secondary font-label-md text-label-md hover:text-error transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
