import React from 'react';
import { NavLink, Outlet, useNavigate, Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Gift,
  Settings,
  Ticket,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdmin();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/claims', icon: Ticket, label: 'Claim Desk' },
    { to: '/admin/customers', icon: Users, label: 'Customers' },
    { to: '/admin/prizes', icon: Gift, label: 'Prize Inventory' },
    { to: '/admin/campaign', icon: Settings, label: 'Campaign Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900/90 border-r border-slate-800/80 p-5 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-fuchsia-600/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-lg text-white font-['Outfit',sans-serif] tracking-tight block">
                ADMIN PORTAL
              </span>
              <span className="text-[11px] text-fuchsia-400 font-semibold tracking-wider uppercase">
                Mobile Hub
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Public Campaign</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </Link>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="truncate mr-2">
              <span className="text-xs font-bold text-white block truncate">
                {admin?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block truncate">
                {admin?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content View */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};
