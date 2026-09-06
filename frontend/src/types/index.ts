export interface Customer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  otp_verified: boolean;
  social_verified: boolean;
  created_at?: string;
  updated_at?: string;
  spin?: {
    id: number;
    prize_name: string;
    claim_code: string;
    status: string;
    claimed_at: string | null;
    spin_date: string;
  } | null;
}

export interface Prize {
  id: number;
  campaign_id: number;
  name: string;
  description: string;
  image_url: string;
  quantity: number;
  remaining_quantity: number;
  weight: number;
  active: boolean;
  is_in_stock: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  instagram_url: string;
  facebook_url: string;
  whatsapp_url: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  terms_conditions: string;
  privacy_policy: string;
  active: boolean;
  max_spins_per_mobile: number;
  is_active_now: boolean;
  prizes?: Prize[];
}

export interface SocialLinkItem {
  platform: 'instagram' | 'facebook' | 'whatsapp';
  name: string;
  url: string;
  displayText: string;
  cta: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  details: {
    registered: boolean;
    otp_verified: boolean;
    social_verified: boolean;
    campaign_active: boolean;
    already_spun: boolean;
  };
  existing_spin?: SpinResultData;
}

export interface SpinResultData {
  spin_id: number;
  claim_code: string;
  status: 'GENERATED' | 'CLAIMED' | 'CANCELLED' | 'EXPIRED';
  created_at: string;
  prize: Prize;
  segment_index: number;
  total_segments: number;
  customer: {
    id: number;
    name: string;
    mobile: string;
  };
  store: {
    name: string;
    address: string;
    phone: string;
  };
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

export interface DashboardStats {
  summary: {
    total_customers: number;
    otp_verified: number;
    eligible_customers: number;
    total_spins: number;
    total_winners: number;
    unclaimed_prizes: number;
    claimed_prizes: number;
    remaining_inventory: number;
    total_initial_inventory: number;
  };
  prize_distribution: Array<{
    id: number;
    name: string;
    total_quantity: number;
    remaining_quantity: number;
    spins_won: number;
    weight: number;
    active: boolean;
  }>;
  trends: {
    registration_trend: Array<{ date: string; count: number }>;
    spin_trend: Array<{ date: string; count: number }>;
  };
}

export interface CheckMobileResult {
  exists: boolean;
  is_new: boolean;
  mobile: string;
  customer: Customer | null;
  has_spun: boolean;
  spin: any | null;
}

