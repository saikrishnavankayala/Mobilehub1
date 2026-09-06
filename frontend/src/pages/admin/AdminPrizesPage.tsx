import React, { useState, useEffect } from 'react';
import { Gift, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { Prize } from '../../types';

export const AdminPrizesPage: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [weight, setWeight] = useState<number>(10);
  const [active, setActive] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrizes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/prizes');
      if (res.data.success) {
        setPrizes(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load prizes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  const handleOpenAdd = () => {
    setEditingPrize(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setQuantity(10);
    setWeight(10);
    setActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Prize) => {
    setEditingPrize(p);
    setName(p.name);
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setQuantity(p.quantity);
    setWeight(p.weight);
    setActive(p.active);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      description,
      image_url: imageUrl,
      quantity: Number(quantity),
      weight: Number(weight),
      active,
    };

    try {
      if (editingPrize) {
        const res = await api.put(`/admin/prizes/${editingPrize.id}`, payload);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchPrizes();
        }
      } else {
        const res = await api.post('/admin/prizes', payload);
        if (res.data.success) {
          setIsModalOpen(false);
          fetchPrizes();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save prize.');
    }
  };

  const handleDelete = async (prizeId: number) => {
    if (!window.confirm('Are you sure you want to deactivate or remove this prize?')) return;
    try {
      await api.delete(`/admin/prizes/${prizeId}`);
      fetchPrizes();
    } catch (err: any) {
      alert(err.message || 'Failed to delete prize.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Prize Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure promotional rewards, stock quantities, and weighted probability distribution
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Prize</span>
        </button>
      </div>

      {/* Prize Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Prize Item</th>
                <th className="py-3.5 px-4">Total Qty</th>
                <th className="py-3.5 px-4">Remaining Stock</th>
                <th className="py-3.5 px-4">Weight Ratio</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading prizes...
                  </td>
                </tr>
              ) : prizes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No prizes found. Click 'Add New Prize' above.
                  </td>
                </tr>
              ) : (
                prizes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-fuchsia-400">
                            <Gift className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div>{p.name}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{p.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-200 font-bold">{p.quantity}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={
                          p.remaining_quantity <= 0
                            ? 'text-rose-400'
                            : p.remaining_quantity < 5
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {p.remaining_quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{p.weight}</td>
                    <td className="py-3 px-4">
                      {p.active && p.remaining_quantity > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : p.remaining_quantity <= 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                          <XCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
                        title="Edit Prize"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                        title="Delete / Deactivate"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingPrize ? 'Edit Prize' : 'Add New Promotional Prize'}
            </h3>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Prize Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ₹500 Mobile Hub Voucher"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Applicable on smartphone purchases above ₹2000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-fuchsia-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Total Quantity</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Probability Weight</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="prize-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-700 text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 bg-slate-950"
                />
                <label htmlFor="prize-active" className="text-slate-300 font-semibold cursor-pointer">
                  Active in Campaign Wheel
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-md shadow-fuchsia-600/30 transition-all"
              >
                {editingPrize ? 'Update Prize' : 'Create Prize'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
