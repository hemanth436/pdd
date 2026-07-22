import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillSwap Exchange | Connect, Teach, Learn & Grow Together',
  description: 'A premium decentralized peer-to-peer platform for exchanging knowledge, mentoring others, and learning new skills without financial transactions.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className="dark">
      <body className="bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-gray-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
