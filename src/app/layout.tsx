import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import FluentRoot from "@/components/FluentRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portal de Relatórios Mensais",
  description: "Portal interno para preenchimento, análise e geração dos relatórios mensais de obras.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FluentRoot>{children}</FluentRoot>
      </body>
    </html>
  );
}
