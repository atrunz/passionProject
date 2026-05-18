import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalShow",
  description: "Lightweight ticketing for local venues, DIY shows, bars, and bands."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
