import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Trophy,
  Gift,
  Boxes,
  Clock,
  Award,
  TrendingUp,
  RotateCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading campaign metrics...</span>
        </div>
      </div>
    );
  }

  const { summary, prize_distribution, trends } = stats;

  const statCards = [
    { title: 'Total Customers', value: summary.total_customers, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'OTP Verified', value: summary.otp_verified, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Eligible Customers', value: summary.eligible_customers, icon: Award, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10' },
    { title: 'Total Spins Used', value: summary.total_spins, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Total Winners', value: summary.total_winners, icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Unclaimed Prizes', value: summary.unclaimed_prizes, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: 'Claimed Prizes', value: summary.claimed_prizes, icon: CheckCircle2, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Remaining Inventory', value: summary.remaining_inventory, icon: Boxes, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Campaign Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time campaign KPIs, prize distributions, and customer activity
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-all shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Charts / Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prize Distribution Bar Breakdown */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
              Prize Inventory & Win Distribution
            </h3>
            <span className="text-xs text-slate-400">
              Total Stock: {summary.total_initial_inventory}
            </span>
          </div>

          <div className="space-y-4">
            {prize_distribution.map((p) => {
              const total = p.total_quantity || 1;
              const winPct = Math.min(100, Math.round((p.spins_won / total) * 100));
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{p.name}</span>
                    <span className="text-slate-400 font-mono">
                      Won: <strong>{p.spins_won}</strong> / Stock: <strong>{p.remaining_quantity}</strong> left
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div
                      style={{ width: `${winPct}%` }}
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7-Day Activity Trends */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                7-Day Activity Trends
              </h3>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Daily customer registrations and spin engagements
            </p>

            {/* Daily stats table */}
            <div className="space-y-3">
              {trends.registration_trend.map((trend, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <span className="font-mono text-slate-300 font-bold">{trend.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-400">
                      Reg: <strong>{trend.count}</strong>
                    </span>
                    <span className="text-fuchsia-400">
                      Spins: <strong>{trends.spin_trend[i]?.count || 0}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
