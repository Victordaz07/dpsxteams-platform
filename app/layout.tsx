import type { Metadata } from "next";
import { inter, dmSans } from "@/lib/utils/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "XTG SaaS Platform",
  description: "Delivery Service Partners Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
