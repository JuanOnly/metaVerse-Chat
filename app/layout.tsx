'use client';

import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ReactNode } from 'react';
import { Providers } from './providers';

export const metadata = {
  title: 'NFT Rarity Scanner',
  description: 'Analyze NFT collection rarity scores and trait analysis',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
