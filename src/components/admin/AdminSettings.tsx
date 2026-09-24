import React, { useState } from 'react';
import {
  Settings,
  Lock,
  DollarSign,
  Save,
  Check,
  RefreshCw,
  Store,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { StoreSettings } from '../../types';
import { WhatsAppLogo, PhoneCallIcon } from '../common/BrandIcons';

interface AdminSettingsProps {
  settings: StoreSettings;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetCatalog: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onSaveSettings,
  onResetCatalog
}) => {
  // Store profile
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [description, setDescription] = useState(settings.description || '');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '$');

  // Contact & Floating buttons
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [enableCallButton, setEnableCallButton] = useState(settings.enableCallButton);
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [enableWhatsappButton, setEnableWhatsappButton] = useState(settings.enableWhatsappButton);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || '');

  // Settings Save Feedback
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveStoreSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StoreSettings = {
      ...settings,
      storeName: storeName.trim() || 'LuxeGrocer & Goods',
      tagline: tagline.trim(),
      description: description.trim(),
      currencySymbol: currencySymbol.trim() || '$',
      contactPhone: contactPhone.trim(),
      enableCallButton,
      whatsappNumber: whatsappNumber.trim(),
      enableWhatsappButton,
      contactEmail: contactEmail.trim(),
      updatedAt: new Date().toISOString()
    };

    onSaveSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Store Settings & Security Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage brand details, currency, floating contact widgets, and administrator authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Store Settings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <form onSubmit={handleSaveStoreSettings} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <Store className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-extrabold text-slate-900">General Store Configuration</h2>
              </div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  Saved Successfully!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  required
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="$"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Premium Groceries, Farm Produce & Artisan Goods"
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 resize-none"
              />
            </div>

            {/* Floating Contact Buttons Section */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Customer Floating Contact Buttons
                </h3>
                <p className="text-[11px] text-slate-400">
                  Configure the bottom floating buttons. Toggling off removes them completely from the customer storefront.
                </p>
              </div>

              {/* Direct Call Button */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <PhoneCallIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Direct Call Button (Left Floating)</span>
                  </div>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+1 (800) 555-0199"
                    className="w-full max-w-xs px-3 py-1.5 border rounded-xl text-xs bg-white outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCallButton}
                    onChange={(e) => setEnableCallButton(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Display Call Button</span>
                </label>
              </div>

              {/* WhatsApp Button */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <WhatsAppLogo className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">WhatsApp Chat Button (Right Floating)</span>
                  </div>
                  <input
                    type="tel"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="e.g. 15551234567 (with country code)"
                    className="w-full max-w-xs px-3 py-1.5 border rounded-xl text-xs bg-white outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWhatsappButton}
                    onChange={(e) => setEnableWhatsappButton(e.target.checked)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-700">Display WhatsApp Button</span>
                </label>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Store Configuration</span>
              </button>
            </div>

          </form>

          {/* Seed Catalog Utility */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Demo Catalog & Sample Orders</h3>
              <p className="text-xs text-slate-500">
                Populate initial products, rich categories, banners, and sample orders for testing.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset catalog to sample categories, banners, products and orders?')) {
                  onResetCatalog();
                }
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Seed Demo Data</span>
            </button>
          </div>

        </div>

        {/* Admin Password Status (Permanently Fixed) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Admin Access Security</h2>
                <span className="text-[11px] text-emerald-600 font-bold">Protected & Locked</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Password Modification Disabled</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Admin password cannot be changed as per security requirements. The portal is permanently protected with the default master credential.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Admin Status:</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                    Active & Verified
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">Access Credentials:</span>
                  <span className="text-slate-500 font-mono text-[11px] bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg">
                    Protected & Hidden
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400">
                <p className="leading-snug">
                  To prevent unauthorized account takeovers and accidental lockout, password changes are permanently blocked.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
