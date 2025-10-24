'use client';
import { usePathname, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, LogOut, Hospital } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { IsClientCtx } from '@/hooks/is-client-ctx';

const getTitleFromPathname = (pathname: string): string => {
    if (pathname === '/') return 'Dashboard';
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment) return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = getTitleFromPathname(pathname);
  const isClient = useContext(IsClientCtx);

  const [clinicName, setClinicName] = useState<string | null>(null);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    if(isClient){
      const storedClinic = sessionStorage.getItem('clinicName');
      const storedUser = sessionStorage.getItem('user');

      if (!storedClinic || !storedUser) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else {
        setClinicName(storedClinic);
        setUser(JSON.parse(storedUser));
      }
    }
  }, [isClient, router]);
  

  const handleLogout = () => {
    // Clear session data
    sessionStorage.removeItem('clinicId');
    sessionStorage.removeItem('clinicName');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold hidden md:block">{title}</h1>
        {clinicName && (
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Hospital className="h-4 w-4" />
                <span>{clinicName}</span>
            </div>
        )}
      </div>


      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 sm:h-10 sm:w-10">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-full">
              <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                <AvatarImage src={`https://picsum.photos/seed/${user?.name || 'user'}/100/100`} alt={user?.name || 'user'} data-ai-hint="person portrait" />
                <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
