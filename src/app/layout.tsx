import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { CopilotSidebar } from "@/components/copilot/copilot-sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockPilot | AI-Powered Portfolio Intelligence",
  description:
    "Build smarter portfolios with AI-driven research, sector analysis, and risk assessment. Research-backed insights for informed investing.",
  keywords: [
    "stock research",
    "portfolio builder",
    "AI investing",
    "stock analysis",
    "sector allocation",
  ],
  openGraph: {
    title: "StockPilot | AI-Powered Portfolio Intelligence",
    description: "Build smarter portfolios with AI-driven research.",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#2E8BEF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <Nav />
        <main>{children}</main>
        <CopilotSidebar />
      </body>
    </html>
  );
}
