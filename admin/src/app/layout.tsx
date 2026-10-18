import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/admin.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'Erkab Organization Admin Portal',
  description: 'Enterprise administration, monitoring, and governance portal for Erkab EdTech Platform.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
