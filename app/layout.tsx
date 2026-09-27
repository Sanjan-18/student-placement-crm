import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalWorkspace from "@/components/layout/GlobalWorkspace";

export const metadata: Metadata = {
  title: "PlacementCRM",
  description: "Student Placement CRM",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><GlobalWorkspace>{children}</GlobalWorkspace></body>
    </html>
  );
}
