import React from 'react';
import { StoreSettings } from '../../types';
import { WhatsAppLogo, PhoneCallIcon } from '../common/BrandIcons';

interface FloatingContactButtonsProps {
  settings: StoreSettings;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({ settings }) => {
  const {
    contactPhone,
    whatsappNumber,
    enableCallButton,
    enableWhatsappButton
  } = settings;

  // Clean numbers for URLs
  const cleanPhone = (contactPhone || '').replace(/[^0-9+]/g, '');
  const cleanWhatsapp = (whatsappNumber || '').replace(/[^0-9]/g, '');

  if (!enableCallButton && !enableWhatsappButton) {
    return null;
  }

  return (
    <div className="fixed bottom-5 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 pointer-events-none flex justify-between items-center max-w-7xl mx-auto">
      
      {/* LEFT: Direct Call Button */}
      {enableCallButton && cleanPhone ? (
        <a
          href={`tel:${cleanPhone}`}
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-700/35 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group border border-emerald-400/40"
          title={`Call us directly at ${contactPhone}`}
          aria-label="Direct Phone Call"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
            <PhoneCallIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="text-left hidden xs:block pr-1">
            <span className="block text-[9px] uppercase font-black text-emerald-100 tracking-wider">Call Directly</span>
            <span className="block text-xs font-black text-white leading-tight">{contactPhone}</span>
          </div>
        </a>
      ) : <div />}

      {/* RIGHT: Real WhatsApp Button */}
      {enableWhatsappButton && cleanWhatsapp ? (
        <a
          href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent('Hello! I would like to inquire about products from your store.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-[#25D366]/40 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 group border border-white/30 ml-auto"
          title="Chat with us on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform flex-shrink-0">
            <WhatsAppLogo className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="text-left hidden xs:block pr-1">
            <span className="block text-[9px] uppercase font-black text-emerald-950/80 tracking-wider">WhatsApp</span>
            <span className="block text-xs font-black text-white leading-tight">Chat with Us</span>
          </div>
        </a>
      ) : null}

    </div>
  );
};
