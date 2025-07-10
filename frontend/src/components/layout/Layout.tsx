'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  HomeIcon,
  UsersIcon,
  CreditCardIcon,
  ChatBubbleBottomCenterTextIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  ChatBubbleBottomCenterTextIcon as ChatIconSolid,
  ChartBarIcon as ChartIconSolid,
  CogIcon as CogIconSolid,
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: HomeIcon, 
    iconSolid: HomeIconSolid,
    description: 'Overview & Analytics',
    color: 'text-blue-500'
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: UsersIcon, 
    iconSolid: UsersIconSolid,
    description: 'User Management',
    color: 'text-green-500'
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: CreditCardIcon, 
    iconSolid: CreditCardIconSolid,
    description: 'Transaction History',
    color: 'text-purple-500'
  },
  { 
    name: 'Refunds', 
    href: '/refunds', 
    icon: CreditCardIcon, 
    iconSolid: CreditCardIconSolid,
    description: 'Refund Requests',
    color: 'text-orange-500'
  },
  { 
    name: 'Support', 
    href: '/support', 
    icon: ChatBubbleBottomCenterTextIcon, 
    iconSolid: ChatIconSolid,
    description: 'Customer Support',
    color: 'text-pink-500'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: ChartBarIcon, 
    iconSolid: ChartIconSolid,
    description: 'Reports & Insights',
    color: 'text-indigo-500'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: CogIcon, 
    iconSolid: CogIconSolid,
    description: 'System Settings',
    color: 'text-gray-500'
  },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const currentNav = navigation.find(item => item.href === pathname);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 transform bg-card border-r transition-transform duration-300 ease-in-out lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </Button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  {currentNav && (
                    <>
                      <div className={cn("p-2 rounded-lg bg-gradient-to-br", 
                        currentNav.color === 'text-blue-500' && 'from-blue-500/10 to-blue-600/10 border border-blue-500/20',
                        currentNav.color === 'text-green-500' && 'from-green-500/10 to-green-600/10 border border-green-500/20',
                        currentNav.color === 'text-purple-500' && 'from-purple-500/10 to-purple-600/10 border border-purple-500/20',
                        currentNav.color === 'text-orange-500' && 'from-orange-500/10 to-orange-600/10 border border-orange-500/20',
                        currentNav.color === 'text-pink-500' && 'from-pink-500/10 to-pink-600/10 border border-pink-500/20',
                        currentNav.color === 'text-indigo-500' && 'from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20',
                        currentNav.color === 'text-gray-500' && 'from-gray-500/10 to-gray-600/10 border border-gray-500/20'
                      )}>
                        <currentNav.iconSolid className={cn("h-5 w-5", currentNav.color)} />
                      </div>
                      <div>
                        <h1 className="text-xl font-semibold text-foreground">{currentNav.name}</h1>
                        <p className="text-sm text-muted-foreground">{currentNav.description}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:block relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
                <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-0.5 text-2xs text-muted-foreground bg-muted border border-border rounded-md">
                  ⌘K
                </kbd>
              </div>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative"
              >
                <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  size="sm" 
                  className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5"
                >
                  3
                </Badge>
              </Button>

              {/* User menu */}
              <div className="flex items-center space-x-3 pl-3 border-l border-border">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-foreground">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user?.role} User
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold shadow-lg">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex justify-end p-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-border bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
            <CommandLineIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight">Moroccoin</div>
            <div className="text-primary-100 text-xs font-medium">Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-primary-500/10 to-primary-600/10 text-primary-600 border border-primary-500/20 shadow-lg shadow-primary-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full" />
              )}
              
              <Icon className={cn(
                'mr-3 h-5 w-5 transition-all duration-200',
                isActive ? 'text-primary-500 scale-110' : 'text-muted-foreground group-hover:text-foreground'
              )} />
              
              <div className="flex-1">
                <div className={cn(
                  'font-medium',
                  isActive && 'text-primary-600'
                )}>
                  {item.name}
                </div>
                <div className="text-2xs text-muted-foreground mt-0.5">
                  {item.description}
                </div>
              </div>

              {/* Hover effect */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-r from-primary-500/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl',
                isActive && 'opacity-100'
              )} />
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="text-sm font-medium text-foreground">System Status</div>
              <div className="text-2xs text-muted-foreground">All systems operational</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}