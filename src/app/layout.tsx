import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Open_Sans, Lato } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-lato',
});

const aeonikPro = localFont({
  src: [
    {
      path: './fonts/aeonik-pro/AeonikPro-Roman-VF.ttf',
      style: 'normal',
    },
    {
      path: './fonts/aeonik-pro/AeonikPro-Italic-VF.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-aeonik-pro',
});

export const metadata: Metadata = {
  title: "Flow - Vector Design",
  description: "A professional vector design tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} ${openSans.variable} ${lato.variable} ${aeonikPro.variable}`}>
        {children}
      </body>
    </html>
  );
}
