import './globals.css';

import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Gomeria - Sistema de Gestion',
  description:
    'Sistema de gestion para gomeria. Administra clientes, pedidos, inventario y finanzas.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans flex min-h-screen w-full flex-col`}>
        {children}
      </body>
      <Analytics />
    </html>
  );
}
