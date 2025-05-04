import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import "@ant-design/v5-patch-for-react-19";
import { AuthProvider } from "@/context/authContext";
import { DashboardProvider } from "@/context/dashboardContext";
import "@ant-design/v5-patch-for-react-19";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Peminjaman Alat Sekolah",
  description: "Manage school inventory efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardProvider>
          <AuthProvider>{children}</AuthProvider>
        </DashboardProvider>
      </body>
    </html>
  );
}
