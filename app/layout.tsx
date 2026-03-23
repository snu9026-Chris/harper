import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harper | 프리미엄 예약",
  description: "프리미엄 지명 예약 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#050b1a] text-[#e8e0d0] antialiased">
        {children}
      </body>
    </html>
  );
}
