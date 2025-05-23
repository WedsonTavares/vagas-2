import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Controle de Vagas",
  description: "Sistema para gerenciar inscrições em vagas de estágio e júnior",
  icons: "/icone.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 text-gray-900 min-h-screen`}>
        <main className="max-w-3xl mx-auto p-4">
          <h1 className="text-3xl font-bold text-center mb-6">Controle de Vagas</h1>
          {children}
        </main>
      </body>
    </html>
  );
}
