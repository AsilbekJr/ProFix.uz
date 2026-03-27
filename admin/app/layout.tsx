import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ProFix.uz | Admin Panel',
  description: 'ProFix.uz platformasini boshqarish paneli',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={cn('font-sans', geist.variable)}>
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

