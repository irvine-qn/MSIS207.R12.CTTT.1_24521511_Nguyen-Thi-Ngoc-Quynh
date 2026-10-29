import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SonicFlow",
  description: "Trình phát nhạc với audio visualizer thời gian thực",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="dark" style={{ colorScheme: "dark" }}>
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
