import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/LandingPage';
import { VerifyPage } from '../pages/VerifyPage';
import { SpinPage } from '../pages/SpinPage';
import { ClaimPage } from '../pages/ClaimPage';
import { SuccessPage } from '../pages/SuccessPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminPrizesPage } from '../pages/admin/AdminPrizesPage';
import { AdminCampaignPage } from '../pages/admin/AdminCampaignPage';
import { AdminClaimsPage } from '../pages/admin/AdminClaimsPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Customer 4-Step Promotional Experience */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/step-1-discover" element={<LandingPage />} />

        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/step-2-verify" element={<VerifyPage />} />

        <Route path="/spin" element={<SpinPage />} />
        <Route path="/step-3-spin" element={<SpinPage />} />

        <Route path="/claim" element={<ClaimPage />} />
        <Route path="/step-4-claim" element={<ClaimPage />} />

        <Route path="/success" element={<SuccessPage />} />
      </Route>

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="claims" element={<AdminClaimsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="prizes" element={<AdminPrizesPage />} />
        <Route path="campaign" element={<AdminCampaignPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
