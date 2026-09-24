import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official Real WhatsApp Logo
 * Exact vector representation of WhatsApp's signature speech bubble and telephone receiver.
 */
export const WhatsAppLogo: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    {/* WhatsApp Green Bubble with Tail */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 3.5C12.678 3.5 3.5 12.678 3.5 24c0 3.864 1.07 7.478 2.923 10.555L3.5 44.5l10.278-2.84A20.404 20.404 0 0024 44.5c11.322 0 20.5-9.178 20.5-20.5S35.322 3.5 24 3.5z"
      fill="#25D366"
    />
    {/* WhatsApp Inner White Receiver Handset */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M34.78 29.17c-.47-.23-2.78-1.37-3.21-1.53-.43-.16-.74-.23-1.06.23-.31.47-1.21 1.53-1.49 1.84-.27.31-.55.35-1.02.12-.47-.24-1.99-.73-3.78-2.33-1.4-1.25-2.34-2.79-2.62-3.26-.27-.47-.03-.72.2-.96.21-.21.47-.55.71-.82.24-.27.31-.47.47-.78.16-.31.08-.59-.04-.82-.12-.24-1.06-2.55-1.45-3.49-.38-.92-.77-.79-1.06-.8h-.9c-.31 0-.82.12-1.25.59-.43.47-1.65 1.61-1.65 3.92 0 2.31 1.69 4.55 1.92 4.86.24.31 3.32 5.07 8.04 7.11 1.12.49 2 .78 2.68 1 .99.32 1.89.27 2.6.17.8-.12 2.78-1.14 3.17-2.24.39-1.1.39-2.04.28-2.24-.12-.2-.43-.31-.9-.55z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Enhanced Real Phone Call Icon
 * Classic handset receiver with calling broadcast waves indicating real direct telephone connection.
 */
export const PhoneCallIcon: React.FC<IconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={size ? { width: size, height: size } : undefined}
    aria-hidden="true"
  >
    {/* Telephone Handset */}
    <path
      d="M19.7 15.65c-1.18 0-2.32-.19-3.38-.54a1.004 1.004 0 00-1.02.24l-2.13 2.13c-2.73-1.39-4.97-3.63-6.36-6.36l2.13-2.13c.27-.27.36-.66.24-1.02A11.08 11.08 0 018.82 4.6c0-.55-.45-1-1-1H4.35c-.55 0-1 .45-1 1 0 9.03 7.32 16.35 16.35 16.35.55 0 1-.45 1-1v-3.47c0-.55-.45-1-.99-1.03l-.01.2z"
      fill="currentColor"
    />
    {/* Outer sound wave */}
    <path
      d="M15 3.5a8.5 8.5 0 018.5 8.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    {/* Inner sound wave */}
    <path
      d="M15 7.5a4.5 4.5 0 014.5 4.5"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);
