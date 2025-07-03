import './globals.css';
import { Metadata } from 'next';
import { Lexend } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Collabglam',
  description: 'A platform for seamless collaborations between brands and influencers.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

const lexend = Lexend({
  subsets: ['latin'],
  weight: '400',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased text-base`}>
        {children}
      </body>
    </html>
  );
}
