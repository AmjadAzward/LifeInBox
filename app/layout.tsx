import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  metadataBase: new URL('https://lifeinbox.app'),
  title: 'LifeInbox - Send it. Forget it. We\'ll remember.',
  description:
    'LifeInbox remembers your bills, appointments, subscriptions, travel, warranties and document expiry dates so you never miss what matters.',
  openGraph: {
    title: 'LifeInbox - Send it. Forget it. We\'ll remember.',
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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
