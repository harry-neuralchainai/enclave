import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Enclave — Private Legal AI",
  description:
    "Self-hosted, private legal AI. Research, review, and draft against your own corpus — inside your VPC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Sidebar />
          {children}
        </div>
      </body>
    </html>
  );
}
