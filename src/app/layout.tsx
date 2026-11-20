import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

// next/font downloads Heebo at build time and serves it from the app itself,
// so no request goes to Google when the game is played.
const heebo = Heebo({
  subsets: ["hebrew"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  title: "לומדים עברית 🌟",
  description: "Hebrew alphabet learning game for toddlers",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e0f2fe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.variable} font-heebo select-none antialiased`}>
        {children}
      </body>
    </html>
  );
}
