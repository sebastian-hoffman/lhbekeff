import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const shopBody = DM_Sans({ variable: "--font-shop-body", subsets: ["latin"] });
const shopDisplay = Barlow_Condensed({ variable: "--font-shop-display", subsets: ["latin"], weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  title: "Lamroth · Preventa Majané 2026",
  description:
    "No te podés quedar sin la remera de Shabat. Remeras, botellitas y toallones Lamroth a precio especial de preventa hasta el 13 de noviembre. Entrega en sedes de Lamroth.",
  icons: {
    icon: "/productos/lamroth-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${shopBody.variable} ${shopDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster richColors position="top-center" />
        </QueryProvider>
      </body>
    </html>
  );
}
