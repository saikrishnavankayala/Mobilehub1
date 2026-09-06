import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertCircle, FileSpreadsheet, Check, Store } from 'lucide-react';
import { api } from '../../services/api';

export const AdminClaimsPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [searchedClaim, setSearchedClaim] = useState<any | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  // List of all recent claims
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);

  const fetchRecentClaims = async () => {
    setIsLoadingClaims(true);
    try {
      const res = await api.get('/claims/admin/list?per_page=15');
      if (res.data.success) {
        setRecentClaims(res.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load recent claims:', err);
    } finally {
      setIsLoadingClaims(false);
    }
  };

  useEffect(() => {
    fetchRecentClaims();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchCode.trim()) return;

    setSearchError(null);
    setRedeemSuccess(null);
    setRedeemError(null);
    setIsSearching(true);

    try {
      const res = await api.get(`/claims/admin/search/${searchCode.trim()}`);
      if (res.data.success) {
        setSearchedClaim(res.data.data);
      }
    } catch (err: any) {
      setSearchedClaim(null);
      setSearchError(err.message || 'Claim code not found. Please verify the code.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRedeem = async () => {
    if (!searchedClaim) return;
    if (!window.confirm(`Confirm redemption of ${searchedClaim.prize?.name} for ${searchedClaim.customer?.name}?`)) {
      return;
    }

    setIsRedeeming(true);
    setRedeemSuccess(null);
    setRedeemError(null);

    try {
      const res = await api.post(`/claims/admin/${searchedClaim.claim_code}/redeem`);
      if (res.data.success) {
        setRedeemSuccess('✓ Prize successfully claimed! Customer handed prize.');
        setSearchedClaim(res.data.data);
        fetchRecentClaims();
      }
    } catch (err: any) {
      setRedeemError(err.message || 'Redemption failed.');
    } finally {
      setIsRedeeming(false);
    }
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
    <div className="space-y-8 max-w-5xl">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Claim Code Verification & Redemption Desk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verify customer vouchers, authenticate claim codes, and mark prizes as redeemed
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

      {/* Claim Lookup Tool Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-fuchsia-400" />
          <span>Search Claim Code</span>
        </h2>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            placeholder="e.g. MH-X8K29P"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base font-mono font-bold text-white tracking-widest uppercase focus:outline-none focus:border-fuchsia-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-600/30 transition-all disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Lookup Code'}
          </button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Redemption Success Alert */}
        {redeemSuccess && (
          <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{redeemSuccess}</span>
          </div>
        )}

        {/* Redemption Error Alert */}
        {redeemError && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{redeemError}</span>
          </div>
        )}

        {/* Matched Claim Result Detail Card */}
        {searchedClaim && (
          <div className="mt-6 p-6 rounded-2xl bg-slate-950 border border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                  CLAIM CODE
                </span>
                <span className="font-mono text-2xl font-black text-fuchsia-400 tracking-wider">
                  {searchedClaim.claim_code}
                </span>
              </div>
              <div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    searchedClaim.status === 'CLAIMED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  STATUS: {searchedClaim.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block">Customer Name:</span>
                <span className="text-sm font-bold text-white">{searchedClaim.customer?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Mobile Number:</span>
                <span className="text-sm font-mono font-bold text-slate-200">
                  +91 {searchedClaim.customer?.mobile}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Winning Prize:</span>
                <span className="text-sm font-bold text-amber-300">{searchedClaim.prize?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Generated Timestamp:</span>
                <span className="text-slate-300">
                  {searchedClaim.created_at
                    ? new Date(searchedClaim.created_at).toLocaleString()
                    : '—'}
                </span>
              </div>
              {searchedClaim.claimed_at && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-semibold block">Redeemed At:</span>
                  <span className="text-emerald-400 font-bold">
                    {new Date(searchedClaim.claimed_at).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-slate-800">
              {searchedClaim.status === 'GENERATED' ? (
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={isRedeeming}
                  className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isRedeeming ? 'Processing Redemption...' : 'REDEEM PRIZE NOW'}</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-slate-900 text-center text-xs text-slate-400 font-semibold">
                  This prize has already been claimed. Re-redemption is prohibited.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Claims Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Spins & Claims History
          </h3>
          <span className="text-xs text-slate-400">Latest 15 records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Claim Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Prize</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoadingClaims ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading claims...
                  </td>
                </tr>
              ) : recentClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No spin claims yet recorded.
                  </td>
                </tr>
              ) : (
                recentClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-fuchsia-300">
                      {claim.claim_code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {claim.customer?.name || '—'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      +91 {claim.customer?.mobile || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-amber-300">
                      {claim.prize?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          claim.status === 'CLAIMED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {claim.created_at ? new Date(claim.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSearchCode(claim.claim_code);
                          setSearchedClaim(claim);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                      >
                        Load
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
