import { Metadata } from "next";
import "./globals.css";
import { Lexend } from "next/font/google";

export const metadata: Metadata = {
  title: "Collabglam",
  description: "A platform for seamless collaborations between brands and influencers."
};

const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lexend.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
