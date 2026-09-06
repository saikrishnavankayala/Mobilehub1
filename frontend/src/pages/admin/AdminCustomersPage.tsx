import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Trophy, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { api } from '../../services/api';
import { Customer } from '../../types';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [otpFilter, setOtpFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomers = async (p = page, q = search, otp = otpFilter) => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/customers', {
        params: {
          page: p,
          per_page: 15,
          search: q || undefined,
          otp_status: otp || undefined,
        },
      });
      if (res.data.success) {
        setCustomers(res.data.data.items);
        setTotalPages(res.data.data.pages || 1);
        setTotalCount(res.data.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page, search, otpFilter);
  }, [page, otpFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers(1, search, otpFilter);
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/export/customers', { responseType: 'blob' });
      const downloadUrl = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'mobile_hub_campaign_report.xlsx';
      link.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export customers:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Registered Customers ({totalCount})
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor customer verification, spin participation, and claim statuses
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Excel (.xlsx)</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={otpFilter}
            onChange={(e) => {
              setOtpFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-fuchsia-500"
          >
            <option value="">All Verification States</option>
            <option value="verified">Verified Customers</option>
            <option value="unverified">Unverified Customers</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">OTP Status</th>
                <th className="py-3.5 px-4">Social</th>
                <th className="py-3.5 px-4">Spin Status</th>
                <th className="py-3.5 px-4">Prize Won</th>
                <th className="py-3.5 px-4">Claim Code</th>
                <th className="py-3.5 px-4">Claim Status</th>
                <th className="py-3.5 px-4">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Loading customer records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{c.address}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      +91 {c.mobile}
                    </td>
                    <td className="py-3 px-4">
                      {c.otp_verified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                          <XCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.social_verified ? (
                        <span className="text-[11px] font-bold text-emerald-400">Done</span>
                      ) : (
                        <span className="text-[11px] text-slate-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {c.spin ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400">
                          <Trophy className="w-3 h-3" /> Spun
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Not Yet</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-300">
                      {c.spin?.prize_name || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-fuchsia-300">
                      {c.spin?.claim_code || '—'}
                    </td>
                    <td className="py-3 px-4">
                      {c.spin?.status ? (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            c.spin.status === 'CLAIMED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {c.spin.status}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
