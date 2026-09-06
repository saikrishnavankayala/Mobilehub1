import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../context/CustomerContext';
import { api } from '../services/api';
import { SocialLinkItem } from '../types';

export const VerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const { customer, completeSocialTasks } = useCustomer();

  // Social links from backend API
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Verification state for exactly 3 platforms: instagram, facebook, whatsapp
  const [verifiedMap, setVerifiedMap] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mobile_hub_social_progress');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      instagram: false,
      facebook: false,
      whatsapp: false,
    };
  });

  // Track if user has opened the external link for each platform
  const [openedMap, setOpenedMap] = useState<Record<string, boolean>>({
    instagram: false,
    facebook: false,
    whatsapp: false,
  });

  const [toastVisible, setToastVisible] = useState(false);

  // Sync if customer already social verified in backend
  useEffect(() => {
    if (customer?.social_verified) {
      setVerifiedMap({
        instagram: true,
        facebook: true,
        whatsapp: true,
      });
      localStorage.setItem('mobile_hub_social_verified', 'true');
    }
  }, [customer]);

  // Fetch social configuration from backend API
  const fetchSocialLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/social-links');
      const links = res.data?.socialLinks || res.data?.data?.socialLinks;
      if (Array.isArray(links) && links.length > 0) {
        setSocialLinks(links);
      } else {
        throw new Error('No social channels returned from server');
      }
    } catch (err: any) {
      console.error('Failed to load social links from backend:', err);
      setError('Unable to load social channels. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  const verifiedCount =
    (verifiedMap.instagram ? 1 : 0) +
    (verifiedMap.facebook ? 1 : 0) +
    (verifiedMap.whatsapp ? 1 : 0);

  const isAllVerified = verifiedCount === 3;
  const progressPercent = Math.round((verifiedCount / 3) * 100);

  const showToastNotification = () => {
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 4000);
  };

  // Handle clicking initial CTA (Follow / Join Channel)
  const handleOpenChannel = (platform: string, url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpenedMap((prev) => ({ ...prev, [platform]: true }));
  };

  // Handle confirming "I've Followed" / "I've Joined"
  const handleConfirmVerification = async (platform: string) => {
    const updated = { ...verifiedMap, [platform]: true };
    setVerifiedMap(updated);
    localStorage.setItem('mobile_hub_social_progress', JSON.stringify(updated));

    const newCount =
      (updated.instagram ? 1 : 0) +
      (updated.facebook ? 1 : 0) +
      (updated.whatsapp ? 1 : 0);

    if (newCount === 3) {
      localStorage.setItem('mobile_hub_social_verified', 'true');
      showToastNotification();
      await completeSocialTasks();
    }
  };

  // Dev & QA helper to toggle verification
  const toggleSimVerification = async () => {
    if (isAllVerified) {
      const reset = { instagram: false, facebook: false, whatsapp: false };
      setVerifiedMap(reset);
      localStorage.removeItem('mobile_hub_social_verified');
      localStorage.removeItem('mobile_hub_social_progress');
    } else {
      const all = { instagram: true, facebook: true, whatsapp: true };
      setVerifiedMap(all);
      localStorage.setItem('mobile_hub_social_verified', 'true');
      localStorage.setItem('mobile_hub_social_progress', JSON.stringify(all));
      showToastNotification();
      await completeSocialTasks();
    }
  };

  const handleProceedToSpin = () => {
    if (!isAllVerified) return;
    navigate('/spin');
  };

  // Render vector SVG icons for platforms (No emojis)
  const renderPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-on-surface">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>
        );
      case 'facebook':
        return (
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0 text-on-surface">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        );
      case 'whatsapp':
      default:
        return (
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center flex-shrink-0 text-tertiary">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-space-xl max-w-lg mx-auto">
      {/* Progress Header & Step Indicator */}
      <div className="flex flex-col gap-space-xs mt-space-sm mb-space-md">
        <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-space-2xs rounded-full bg-primary-fixed text-primary">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">
            Step 2 of 4 • Gate Access
          </span>
        </div>
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-bold tracking-tight">
          Follow MobileHub &amp; Unlock Your Spin
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Follow MobileHub on our official social channels and verify your participation to unlock the reward wheel.
        </p>
      </div>

      {/* Realtime Status Meter Module (Out of 3) */}
      <div className="flex flex-col gap-space-sm p-space-md rounded-xl bg-surface-container-lowest shadow-sm mb-space-lg border border-surface-container/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className={`w-2 h-2 rounded-full ${isAllVerified ? 'bg-tertiary' : 'bg-primary'} animate-pulse`} />
            <span className="font-label-lg text-label-lg text-on-surface font-bold" id="counter-label">
              {verifiedCount} of 3 completed
            </span>
          </div>
          <span
            className={`font-label-md text-label-md px-space-xs py-space-2xs rounded-full font-bold ${
              isAllVerified
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : 'bg-primary-fixed text-primary'
            }`}
            id="pct-badge"
          >
            {progressPercent}%
          </span>
        </div>

        {/* Progress Track & Fill */}
        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isAllVerified ? 'bg-tertiary' : 'bg-primary-container'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-on-surface-variant">
          <p className="font-body-sm text-body-sm" id="status-hint">
            {isAllVerified
              ? 'All channels verified. You are ready to spin!'
              : `Complete ${3 - verifiedCount} more social channel${3 - verifiedCount > 1 ? 's' : ''} to unlock the wheel.`}
          </p>
          <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary font-bold">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            <span>Instant Sync</span>
          </div>
        </div>
      </div>

      {/* Social Verification Cards Stack (Exactly 3 Channels: Instagram, Facebook, WhatsApp) */}
      <div className="flex flex-col gap-space-sm mb-space-lg">
        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-space-sm">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 animate-pulse"
              >
                <div className="flex items-center gap-space-sm min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex-shrink-0" />
                  <div className="flex flex-col gap-2 flex-1 max-w-[200px]">
                    <div className="h-4 bg-surface-container-high rounded w-24" />
                    <div className="h-3 bg-surface-container-high rounded w-44" />
                  </div>
                </div>
                <div className="w-20 h-9 bg-surface-container-high rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Clean Retry */}
        {!isLoading && error && (
          <div className="flex flex-col items-center text-center p-space-lg rounded-xl bg-surface-container-lowest shadow-sm border border-error/30 gap-space-sm">
            <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">cloud_off</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Unable to load social channels
              </span>
              <p className="font-body-sm text-body-sm text-secondary">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={fetchSocialLinks}
              className="mt-space-xs px-space-md py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Dynamic 3 Social Cards from Backend API */}
        {!isLoading && !error && socialLinks.map((item) => {
          const key = item.platform.toLowerCase();
          const isVerified = Boolean(verifiedMap[key]);
          const hasOpened = Boolean(openedMap[key]);

          return (
            <div
              key={item.platform}
              className="flex items-center justify-between p-space-md rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/60 transition-all"
            >
              <div className="flex items-center gap-space-sm min-w-0">
                {renderPlatformIcon(item.platform)}
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                    {item.name}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {item.displayText}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 pl-space-xs">
                {isVerified ? (
                  /* Verified State */
                  <span className="inline-flex items-center gap-1 px-space-sm py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md font-bold">
                    <span className="material-symbols-outlined text-[16px] text-tertiary font-bold">check</span>
                    <span>{key === 'whatsapp' ? 'Joined' : 'Following'}</span>
                  </span>
                ) : hasOpened ? (
                  /* Confirmation State after clicking external link */
                  <button
                    type="button"
                    onClick={() => handleConfirmVerification(key)}
                    className="px-space-md py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-sm active:scale-95 transition-all flex items-center gap-1 font-bold cursor-pointer animate-in fade-in"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{key === 'whatsapp' ? "I've Joined" : "I've Followed"}</span>
                  </button>
                ) : (
                  /* Initial CTA State (Follow / Join Channel) */
                  <button
                    type="button"
                    onClick={() => handleOpenChannel(key, item.url)}
                    className="px-space-md py-2 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-sm active:scale-95 transition-all flex items-center gap-1.5 font-bold cursor-pointer hover:bg-primary"
                  >
                    <span>{item.cta}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Locked / Unlocked Wheel Gateway Card (Out of 3) */}
      <div
        className={`flex flex-col gap-space-md p-space-lg rounded-xl shadow-lg relative overflow-hidden transition-all duration-500 ${
          isAllVerified
            ? 'bg-surface-container-lowest text-on-surface shadow-xl border border-surface-container'
            : 'bg-inverse-surface text-inverse-on-surface'
        }`}
      >
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-primary/20 blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-space-sm">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isAllVerified
                  ? 'bg-tertiary-fixed text-tertiary'
                  : 'bg-on-surface/10 text-primary-fixed'
              }`}
            >
              <span className="material-symbols-outlined text-[24px]">
                {isAllVerified ? 'check_circle' : 'lock'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-bold">
                {isAllVerified ? '✓ Verification Complete' : 'Complete all social verifications to unlock the wheel.'}
              </span>
              <span
                className={`font-label-sm text-label-sm uppercase tracking-wider font-bold ${
                  isAllVerified ? 'text-tertiary' : 'text-primary-fixed'
                }`}
              >
                {isAllVerified ? '3 of 3 Verified • Wheel Unlocked' : `${verifiedCount} of 3 completed`}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[20px]">security</span>
        </div>

        <p
          className={`font-body-md text-body-md relative z-10 leading-relaxed ${
            isAllVerified ? 'text-on-surface-variant' : 'text-inverse-on-surface/80'
          }`}
        >
          {isAllVerified
            ? "You're all set! You have successfully completed social verification and unlocked your exclusive MobileHub Spin & Win reward chance."
            : 'Follow our official Instagram, Facebook, and WhatsApp channels above to unlock the physical 6-segment promotional wheel.'}
        </p>

        <div className="relative z-10 pt-space-xs">
          {isAllVerified ? (
            <button
              type="button"
              id="spinAndWinBtn"
              onClick={handleProceedToSpin}
              className="w-full py-3.5 px-space-md rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 hover:bg-primary transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">rotate_right</span>
              <span>Spin &amp; Win</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-space-md rounded-xl bg-secondary-container/40 text-on-secondary-container font-label-lg text-label-lg flex items-center justify-center gap-2 cursor-not-allowed transition-all duration-300 font-bold opacity-80"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              <span>Complete all social verifications to unlock the wheel.</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Simulation Bar for Testing */}
      <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col gap-space-xs shadow-sm border border-surface-container/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
            <span className="font-label-md text-label-md text-on-surface font-semibold">Dev &amp; Testing Preview</span>
          </div>
          <button
            type="button"
            onClick={toggleSimVerification}
            className="px-space-sm py-1 rounded-lg bg-surface-container-highest text-on-surface font-label-sm text-label-sm font-bold hover:bg-secondary-container transition-colors cursor-pointer"
          >
            {isAllVerified ? 'Reset Verification' : 'Verify All 3 Channels'}
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Click the official channels above to open links and confirm follow, or use the testing toggle to verify all 3 channels instantly.
        </p>
      </div>

      {/* Floating Success Toast Notification */}
      <div
        className={`fixed top-20 left-4 right-4 z-50 p-space-md rounded-xl bg-tertiary text-on-tertiary shadow-xl flex items-center gap-space-sm transition-all duration-500 ease-out max-w-md mx-auto ${
          toastVisible
            ? 'translate-y-0 opacity-100'
            : '-translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-8 h-8 rounded-full bg-on-tertiary/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[20px] text-on-tertiary font-bold">check_circle</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-lg text-label-lg font-bold truncate">✓ Verification Complete</span>
          <span className="font-body-sm text-body-sm opacity-90 truncate">Reward wheel unlocked and ready to spin!</span>
        </div>
      </div>
    </div>
  );
};
