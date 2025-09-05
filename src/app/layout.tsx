'use client';

import './globals.css';
import { Toaster } from "@/components/ui/sonner";
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { RealtimeStockNotifier } from '@/components/layout/realtime-stock-notifier';

// Metadata can't be used in a client component.
// We can either move it to a separate file or handle it differently if needed.
// For now, let's keep it simple and comment it out to make the layout a client component.
// export const metadata: Metadata = {
//   title: 'Civintory',
//   description: 'An interactive and responsive inventory management system.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <title>Civintory</title>
        <meta name="description" content="Sistem manajemen inventaris yang interaktif dan responsif." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <SidebarProvider>
          <Sidebar>
            <AppSidebar />
          </Sidebar>
          <SidebarInset>
            <AppHeader />
            <main className="p-4 sm:p-6 lg:p-8 flex-1">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
        <RealtimeStockNotifier />
      </body>
    </html>
  );
}
