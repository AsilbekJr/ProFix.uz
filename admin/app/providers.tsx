'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }
          }}
        />
        {children}
      </ThemeProvider>
    </Provider>
  );
}

