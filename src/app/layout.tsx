import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#edf0f5' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chakribakri.app'),
  title: {
    default: 'chakriBakri — Personal Job Application Tracker',
    template: '%s | chakriBakri',
  },
  description:
    'Clean, modern personal job application tracker with interactive Drag & Drop Kanban, SSR paginated list & grid views, and interview analytics.',
  keywords: [
    'job application tracker',
    'career management',
    'kanban board',
    'interview tracker',
    'job tracker',
    'job search pipeline',
    'chakriBakri',
  ],
  authors: [{ name: 'chakriBakri Team' }],
  creator: 'chakriBakri',
  publisher: 'chakriBakri',
  applicationName: 'chakriBakri',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [{ url: '/favicon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://chakribakri.app',
    siteName: 'chakriBakri',
    title: 'chakriBakri — Personal Job Application Tracker',
    description:
      'Organize, track, and streamline your job search with a sleek drag-and-drop Kanban board, metrics bar, and paginated views.',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'chakriBakri Logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'chakriBakri — Personal Job Application Tracker',
    description:
      'Organize, track, and streamline your job search with a sleek drag-and-drop Kanban board, metrics bar, and paginated views.',
    images: ['/favicon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistSans.className} font-sans min-h-screen bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
