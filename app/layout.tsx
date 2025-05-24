import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { ClientLayout } from "@/components/common/layout/layout-authorization";
import ActivityTracker from '@/components/activity-tracker';
import { LoadingSpinner } from "@/components/common/utils/loading-spinner";
import { WithDebug } from "@/components/debug";
import React from 'react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OTLS - Online Teaching and Learning Solution",
  description: "Nền tảng dạy và học trực tuyến",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ActivityTracker />
          <LoadingSpinner />
          <WithDebug position="bottom-right">
            <ClientLayout>
              {children}
              <Toaster />
            </ClientLayout>
          </WithDebug>
        </Providers>
      </body>
    </html>
  );
}
