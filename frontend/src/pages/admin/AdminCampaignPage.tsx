import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { Campaign } from '../../types';

export const AdminCampaignPage: React.FC = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [active, setActive] = useState(true);
  const [maxSpins, setMaxSpins] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/campaign');
      if (res.data.success) {
        const c: Campaign = res.data.data;
        setCampaign(c);
        setName(c.name);
        setDescription(c.description || '');
        setInstagramUrl(c.instagram_url || '');
        setFacebookUrl(c.facebook_url || '');
        setWhatsappUrl(c.whatsapp_url || '');
        setStoreName(c.store_name || '');
        setStoreAddress(c.store_address || '');
        setStorePhone(c.store_phone || '');
        setTerms(c.terms_conditions || '');
        setPrivacy(c.privacy_policy || '');
        setActive(c.active);
        setMaxSpins(c.max_spins_per_mobile || 1);
      }
    } catch (err) {
      console.error('Failed to load campaign settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      name,
      description,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      whatsapp_url: whatsappUrl,
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
      terms_conditions: terms,
      privacy_policy: privacy,
      active,
      max_spins_per_mobile: Number(maxSpins),
    };

    try {
      const res = await api.put('/admin/campaign', payload);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Campaign settings successfully updated!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center text-slate-500 text-xs">Loading campaign settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
          Campaign Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize promotional copy, store details, social media URLs, and legal policies
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Campaign Basics */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            General Campaign Details
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Promotional Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Max Spins Per Verified Mobile
              </label>
              <input
                type="number"
                min={1}
                value={maxSpins}
                onChange={(e) => setMaxSpins(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default: 1 spin per customer</span>
            </div>

            <div className="flex items-center gap-2 sm:pt-6">
              <input
                type="checkbox"
                id="active-campaign-toggle"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-slate-700 text-fuchsia-600 focus:ring-fuchsia-500 w-4 h-4 bg-slate-950"
              />
              <label htmlFor="active-campaign-toggle" className="text-xs text-slate-300 font-bold cursor-pointer">
                Campaign is Currently Active
              </label>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Social Media Participation Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Instagram URL</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Facebook URL</label>
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Channel</label>
              <input
                type="url"
                value={whatsappUrl}
                onChange={(e) => setWhatsappUrl(e.target.value)}
                placeholder="https://wa.me/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>
        </div>

        {/* Store Info */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Mobile Hub Store Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Helpline Phone</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Store Address</label>
            <input
              type="text"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        {/* Policies */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Rules & Policies
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Privacy Policy</label>
            <textarea
              rows={3}
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-lg shadow-fuchsia-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Campaign Settings'}</span>
        </button>
      </form>
    </div>
  );
};
