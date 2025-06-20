
import { Metadata } from "next";
import "./globals.css";
import { Lexend } from "next/font/google";

export const metadata: Metadata = {
  title: "ShareMitra",
  description: "ShareMitra is a platform for sharing and discovering content."
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>{children}</body>
    </html>
  );
}
