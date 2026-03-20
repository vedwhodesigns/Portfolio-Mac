import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio — Aqua OS",
  description: "CGI, VFX & Graphic Design Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Lucida Grande web font — for Windows / Linux / Android where it's not a system font */}
        <link rel="preconnect" href="https://fonts.cdnfonts.com" />
        <link
          rel="stylesheet"
          href="https://fonts.cdnfonts.com/css/lucida-grande"
        />
      </head>
      <body style={{ margin: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
