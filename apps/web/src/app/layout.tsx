import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IB Student Jobs",
  description: "A tracker for IB summer analyst and full-time roles."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="pointer-events-none fixed inset-0 opacity-60">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_20%_0%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(900px_circle_at_80%_20%,hsl(var(--primary)/0.12),transparent_55%)]" />
        </div>
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
