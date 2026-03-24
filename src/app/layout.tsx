import type { Metadata } from "next";
import "@fontsource/luckiest-guy";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIL Readers & Leaders",
  description: "Helping children become confident readers",
  icons: {
    icon: "/icon.jpeg",
    apple: "/icon.jpeg",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}