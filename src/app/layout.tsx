import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/header";
import { MainNav } from "@/components/main-nav";
import { Icons } from "@/components/icons";

const font = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "WealthWise AI",
  description: "AI-powered finance management for comprehensive personal financial oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", font.className)}>
        <Toaster />
        <SidebarProvider>
          <div className="min-h-screen w-full">
            <Sidebar variant="sidebar" collapsible="icon">
              <div className="flex h-full flex-col">
                <div className="flex h-14 items-center border-b px-4">
                  <a href="/" className="flex items-center gap-2 font-semibold text-primary">
                    <Icons.logo className="h-6 w-6" />
                    <span className="group-data-[collapsible=icon]:hidden">
                      WealthWise AI
                    </span>
                  </a>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <MainNav />
                </div>
              </div>
            </Sidebar>
            <SidebarInset>
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
                {children}
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
