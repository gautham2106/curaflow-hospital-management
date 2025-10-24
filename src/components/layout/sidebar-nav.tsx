
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Settings,
  ListOrdered,
  LifeBuoy,
  PlusCircle,
  BookUser,
  GalleryHorizontal,
} from 'lucide-react';
import { CuraFlowLogo } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IsClientCtx } from '@/hooks/is-client-ctx';
import { useContext, useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/queue', label: 'Live Queue', icon: ListOrdered },
  { href: '/register', label: 'Visit Register', icon: BookUser },
  { href: '/generate-token', label: 'Generate Token', icon: PlusCircle },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/ad-resources', label: 'Ad Resources', icon: GalleryHorizontal },
];

const helpAndSettingsItems = [
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/support', label: 'Support', icon: LifeBuoy },
]

export function SidebarNav() {
  const pathname = usePathname();
  const isClient = useContext(IsClientCtx);
  const [user, setUser] = useState<{name: string, username: string} | null>(null);

  useEffect(() => {
    if(isClient){
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [isClient]);

  const isActive = (href: string) => {
    if (href === '/') {
        return pathname === '/';
    }
    // Updated to handle both /doctors and /doctors/schedules
    if (href === '/doctors') {
        return pathname.startsWith('/doctors');
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
            <CuraFlowLogo className="text-sidebar-primary w-8 h-8" />
            <h1 className="font-semibold text-lg text-white">CuraFlow</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <span>
                    <item.icon />
                    <span>{item.label}</span>
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
            {helpAndSettingsItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href}>
                    <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={{ children: item.label }}
                    >
                    <span>
                      <item.icon />
                      <span>{item.label}</span>
                    </span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
        <div className="p-2 mt-2 border-t border-sidebar-border">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/${user?.name || 'user'}/100/100`} alt={user?.name || 'user'} data-ai-hint="person portrait" />
                    <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">{user?.name || 'Admin User'}</span>
                    <span className="text-xs text-sidebar-foreground/70">{user?.username || 'admin'}@curaflow.com</span>
                </div>
            </div>
        </div>
      </SidebarFooter>
    </>
  );
}
