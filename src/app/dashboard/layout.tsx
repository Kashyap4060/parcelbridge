'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { 
  PaperAirplaneIcon, 
  TruckIcon, 
  CreditCardIcon, 
  UserCircleIcon,
  CogIcon,
  MapIcon,
  Bars3Icon,
  XMarkIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
}

const navigation: SidebarNavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: CogIcon },
  { title: 'Fee Calculator', href: '/dashboard/sender/fee-calculator', icon: CalculatorIcon, roles: ['sender'] },
  { title: 'Create Request', href: '/dashboard/sender/create-request', icon: PaperAirplaneIcon, roles: ['sender'] },
  { title: 'My Requests', href: '/dashboard/sender/requests', icon: TruckIcon, roles: ['sender'] },
  { title: 'Add Journey', href: '/dashboard/carrier/add-journey', icon: MapIcon, roles: ['carrier'] },
  { title: 'My Journeys', href: '/dashboard/carrier/journeys', icon: TruckIcon, roles: ['carrier'] },
  { title: 'Find Parcels', href: '/dashboard/carrier/parcels', icon: PaperAirplaneIcon, roles: ['carrier'] },
  { title: 'Wallet', href: '/dashboard/wallet', icon: CreditCardIcon },
  { title: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useSimpleAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    !item.roles || (user?.role && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="flex items-center justify-between p-6 border-b">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Parcel Bridge</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role || 'No role selected'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className="p-4 border-t space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ModeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                signOut();
                router.push('/');
              }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-card border-b p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">
              Parcel Bridge
            </h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
