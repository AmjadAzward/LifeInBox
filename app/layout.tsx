import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'LifeInbox — Send it. Forget it. We\'ll remember.',
  description:
    'LifeInbox remembers your bills, appointments, subscriptions, travel, warranties and document expiry dates so you never miss what matters.',
  openGraph: {
    title: 'LifeInbox — Send it. Forget it. We\'ll remember.',
    description:
      'LifeInbox remembers your bills, appointments, subscriptions, travel, warranties and document expiry dates so you never miss what matters.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
