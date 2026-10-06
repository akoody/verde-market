import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Header } from "@/shared/ui/header";
import { Footer } from "@/shared/ui/footer";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "Verde — фермерские продукты рядом",
    template: "%s — Verde",
  },
  description: "Свежие продукты напрямую от проверенных фермеров с доставкой до двери.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={nunito.variable} data-scroll-behavior="smooth">
      <body className="pb-[66px] md:pb-0">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
