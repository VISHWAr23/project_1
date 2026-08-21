'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  src?: string;
  alt?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { px: 24, class: 'w-6 h-6' },
  sm: { px: 32, class: 'w-8 h-8' },
  md: { px: 40, class: 'w-10 h-10' },
  lg: { px: 48, class: 'w-12 h-12' },
  xl: { px: 64, class: 'w-16 h-16' },
};

export function AppLogo({
  size = 'sm',
  className = '',
  src = '/logo.png',
  alt = 'Shri Lathikka Surgicals Logo',
  priority = true,
}: AppLogoProps) {
  const [hasError, setHasError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.sm;

  if (hasError) {
    // Fallback vector icon if user's custom image fails or is missing
    return (
      <div
        className={`bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md shrink-0 select-none ${sizeConfig.class} ${className}`}
        title={alt}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
        >
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg shadow-xs flex items-center justify-center ${sizeConfig.class} ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={sizeConfig.px}
        height={sizeConfig.px}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain select-none"
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

export default AppLogo;
