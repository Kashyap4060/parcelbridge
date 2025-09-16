'use client';

import { SimpleAuthProvider } from '@/hooks/useSimpleAuth';
import { Toaster } from 'react-hot-toast';
import { ReactNode } from 'react';
import AuthRedirectHandler from '@/components/auth/AuthRedirectHandler';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SimpleAuthProvider>
      <AuthRedirectHandler />
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </SimpleAuthProvider>
  );
}




