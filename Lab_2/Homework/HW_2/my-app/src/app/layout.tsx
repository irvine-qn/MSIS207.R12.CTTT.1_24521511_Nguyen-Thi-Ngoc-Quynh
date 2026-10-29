import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HW2 App",
  description: "Next.js + TypeScript + Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
