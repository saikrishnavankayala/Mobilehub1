import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Customer, Campaign, EligibilityResult, CheckMobileResult } from '../types';

interface CustomerContextType {
  customer: Customer | null;
  token: string | null;
  campaign: Campaign | null;
  eligibility: EligibilityResult | null;
  isLoading: boolean;
  activeDevOtp: string | null;
  existingSpin: any | null;
  hasSpun: boolean;
  checkMobile: (mobile: string) => Promise<CheckMobileResult>;
  register: (name: string, mobile: string, address: string) => Promise<{ success: boolean; message: string; dev_otp?: string }>;
  verifyOtp: (mobile: string, otp: string) => Promise<{ success: boolean; message: string; has_spun?: boolean; spin?: any }>;
  resendOtp: (mobile: string) => Promise<{ success: boolean; message: string; dev_otp?: string }>;
  completeSocialTasks: () => Promise<boolean>;
  refreshEligibility: () => Promise<void>;
  refreshCampaign: () => Promise<void>;
  clearCustomerSession: () => void;
  logout: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('mobile_hub_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mobile_hub_customer_token'));
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDevOtp, setActiveDevOtp] = useState<string | null>(null);
  const [existingSpin, setExistingSpin] = useState<any | null>(null);
  const [hasSpun, setHasSpun] = useState<boolean>(false);

  const clearCustomerSession = useCallback(() => {
    setCustomer(null);
    setToken(null);
    setEligibility(null);
    setActiveDevOtp(null);
    setExistingSpin(null);
    setHasSpun(false);
    localStorage.removeItem('mobile_hub_customer');
    localStorage.removeItem('mobile_hub_customer_token');
    localStorage.removeItem('mobile_hub_user_mobile');
    localStorage.removeItem('mobile_hub_spin_completed');
    localStorage.removeItem('mobile_hub_last_win');
    localStorage.removeItem('mobile_hub_claim_submitted');
    localStorage.removeItem('mobile_hub_social_verified');
    localStorage.removeItem('mobile_hub_social_progress');
  }, []);

  const refreshCampaign = useCallback(async () => {
    try {
      const res = await api.get('/campaign/active');
      if (res.data?.success) {
        setCampaign(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load active campaign:', err);
    }
  }, []);

  const refreshEligibility = useCallback(async () => {
    if (!token) {
      setEligibility(null);
      return;
    }
    try {
      const res = await api.get('/campaign/eligibility');
      if (res.data?.success) {
        setEligibility(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load eligibility:', err);
    }
  }, [token]);

  // Sync spin status for authenticated customer
  const syncCustomerSpinStatus = useCallback(async (mobile: string) => {
    if (!mobile) return;
    try {
      const res = await api.get('/spin/status', {
        params: { mobileNumber: mobile }
      });
      if (res.data?.has_spun) {
        setHasSpun(true);
        setExistingSpin(res.data.spin);
        localStorage.setItem('mobile_hub_spin_completed', 'true');
        if (res.data.spin) {
          localStorage.setItem(
            'mobile_hub_last_win',
            JSON.stringify({
              prizeName: res.data.spin.prize?.name || res.data.spin.prize_name,
              claimCode: res.data.spin.claim_code,
              status: res.data.spin.status,
              claimed_at: res.data.spin.claimed_at,
              category: res.data.spin.prize?.category || 'Promotion'
            })
          );
        }
      } else {
        setHasSpun(false);
        setExistingSpin(null);
        localStorage.removeItem('mobile_hub_spin_completed');
        localStorage.removeItem('mobile_hub_last_win');
      }
    } catch (err) {
      console.error('Failed to sync customer spin status:', err);
    }
  }, []);

  useEffect(() => {
    refreshCampaign();
  }, [refreshCampaign]);

  useEffect(() => {
    if (token && customer?.mobile) {
      refreshEligibility();
      syncCustomerSpinStatus(customer.mobile);
    }
  }, [token, customer?.mobile, refreshEligibility, syncCustomerSpinStatus]);

  // Check mobile in DB
  const checkMobile = async (mobile: string): Promise<CheckMobileResult> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/check-mobile', { mobile });
      const data = res.data?.data;
      if (data?.exists) {
        setExistingSpin(data.spin);
        setHasSpun(Boolean(data.has_spun));
      }
      return data;
    } catch (err: any) {
      console.error('Failed to check mobile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, mobile: string, address: string) => {
    setIsLoading(true);
    try {
      // Clear any past session before registering a new number
      clearCustomerSession();

      const res = await api.post('/customers/register', { name, mobile, address });
      const data = res.data;
      if (data.data?.dev_otp) {
        setActiveDevOtp(data.data.dev_otp);
      }
      setCustomer(data.data.customer);
      localStorage.setItem('mobile_hub_user_mobile', mobile);
      return {
        success: true,
        message: data.message,
        dev_otp: data.data?.dev_otp
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (mobile: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { mobile, otp });
      const data = res.data.data;
      setToken(data.token);
      setCustomer(data.customer);
      localStorage.setItem('mobile_hub_customer_token', data.token);
      localStorage.setItem('mobile_hub_customer', JSON.stringify(data.customer));
      localStorage.setItem('mobile_hub_user_mobile', mobile);
      setActiveDevOtp(null);

      if (data.has_spun && data.spin) {
        setHasSpun(true);
        setExistingSpin(data.spin);
        localStorage.setItem('mobile_hub_spin_completed', 'true');
        localStorage.setItem(
          'mobile_hub_last_win',
          JSON.stringify({
            prizeName: data.spin.prize?.name || data.spin.prize_name,
            claimCode: data.spin.claim_code,
            status: data.spin.status,
            claimed_at: data.spin.claimed_at,
            category: data.spin.prize?.category || 'Promotion'
          })
        );
      } else {
        setHasSpun(false);
        setExistingSpin(null);
        localStorage.removeItem('mobile_hub_spin_completed');
        localStorage.removeItem('mobile_hub_last_win');
      }

      return {
        success: true,
        message: res.data.message,
        has_spun: data.has_spun,
        spin: data.spin
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'OTP verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (mobile: string) => {
    try {
      const res = await api.post('/auth/send-otp', { mobile });
      const data = res.data;
      if (data.data?.dev_otp) {
        setActiveDevOtp(data.data.dev_otp);
      }
      return { success: true, message: data.message, dev_otp: data.data?.dev_otp };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to resend OTP' };
    }
  };

  const completeSocialTasks = async () => {
    try {
      const res = await api.post('/customers/social-verify');
      if (res.data?.success) {
        setCustomer(res.data.data.customer);
        localStorage.setItem('mobile_hub_customer', JSON.stringify(res.data.data.customer));
        await refreshEligibility();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Social verification failed:', err);
      return false;
    }
  };

  const logout = () => {
    clearCustomerSession();
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        campaign,
        eligibility,
        isLoading,
        activeDevOtp,
        existingSpin,
        hasSpun,
        checkMobile,
        register,
        verifyOtp,
        resendOtp,
        completeSocialTasks,
        refreshEligibility,
        refreshCampaign,
        clearCustomerSession,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomer must be used within a CustomerProvider');
  return context;
};
