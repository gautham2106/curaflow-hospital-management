
import React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { redirect } from 'next/navigation';
import { IsClientCtxProvider } from '@/hooks/is-client-ctx';

// This is a server component, so we can't use hooks directly here
// But we can create a client component to handle the client-side session check
import ClientSessionCheck from './client-session-check';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <IsClientCtxProvider>
      <ClientSessionCheck />
      <SidebarProvider>
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-col flex-1 min-h-screen">
          <Header />
          <SidebarInset>
              <main className="flex flex-col flex-1 p-4 md:p-6 lg:p-8">
                  {children}
              </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </IsClientCtxProvider>
  );
}
