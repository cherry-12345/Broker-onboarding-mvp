'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
}

interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

interface RecentCustomer {
  id: string;
  fullName: string;
  email: string;
  gstin: string;
  entityType: 'EXPORTER' | 'IMPORTER';
  createdAt: string;
  broker: {
    fullName: string;
    email: string;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalCustomers: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      try {
        const res = await api.get('/admin/overview');
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers);
        setRecentCustomers(res.data.recentCustomers);
      } catch {
        toast.error('Failed to load admin dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">System-wide overview of brokers and customers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Brokers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Brokers</h2>
          </div>
          {recentUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No brokers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Customers</h2>
          </div>
          {recentCustomers.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No customers found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">GSTIN</th>
                    <th className="px-6 py-3">Broker</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{customer.gstin}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium text-gray-900">{customer.broker.fullName}</div>
                        <div className="text-xs text-gray-500">{customer.broker.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
