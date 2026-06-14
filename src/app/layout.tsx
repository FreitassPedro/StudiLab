import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import QueryProvider from "./providers/QueryProvider";
import { UserSelector } from "@/components/UserSelector";

import MainNavbar from "@/components/MainNavbar";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitor de Estudos",
  description: "Acompanhe suas sessões de estudo, visualize seu progresso e otimize seu tempo de aprendizado com o Monitor de Estudos. Registre suas atividades, defina metas e mantenha-se motivado para alcançar seus objetivos acadêmicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} antialiased`}
      >
        <ThemeProvider attribute={"class"}
          defaultTheme="system"
          enableSystem
        >
          <QueryProvider>
            <UserSelector />
            <MainNavbar />
            {children}
            <Toaster position="bottom-right" />

          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
