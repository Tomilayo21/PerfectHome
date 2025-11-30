"use client"
import { useEffect, useState } from "react";
import './globals.css';
import { Outfit } from 'next/font/google';
import { AppContextProvider } from '@/context/AppContext';
import AnalyticsTracker from '@/components/admin/AnalyticsTracker';

import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {


  return (
    <html lang="en" className={outfit.className}>
      <body className="antialiased">
        <SessionProvider>
          <AppContextProvider>
            <Toaster position="top-right" />
              <AnalyticsTracker>
                {children}
              </AnalyticsTracker>  
          </AppContextProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
