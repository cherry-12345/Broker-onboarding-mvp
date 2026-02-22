'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  HomeIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from './Icons';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const brokerLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { href: '/dashboard/onboard', label: 'Onboard Customer', icon: <UserPlusIcon /> },
    { href: '/dashboard/admin', label: 'Admin', icon: <ShieldCheckIcon /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 min-h-screen">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">Neximprove</h1>
          <p className="text-sm text-gray-500 mt-1">Broker Portal</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {brokerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <ArrowRightOnRectangleIcon />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          {brokerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {link.icon}
                <span className="truncate max-w-[70px]">{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600"
          >
            <ArrowRightOnRectangleIcon />
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
