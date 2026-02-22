'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminStats {
  totalBrokers: number;
  totalCustomers: number;
  exporters: number;
  importers: number;
}

interface Broker {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  customerCount: number;
}

interface Customer {
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({ totalBrokers: 0, totalCustomers: 0, exporters: 0, importers: 0 });
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'brokers' | 'customers'>('brokers');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, brokersRes, customersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/brokers'),
          api.get('/admin/customers'),
        ]);
        setStats(statsRes.data.stats);
        setBrokers(brokersRes.data.brokers);
        setCustomers(customersRes.data.customers);
      } catch {
        toast.error('Failed to load admin data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of all brokers and customers on the platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Brokers</p>
          <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalBrokers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Exporters</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.exporters}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Importers</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{stats.importers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('brokers')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'brokers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Brokers ({brokers.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'customers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers ({customers.length})
          </button>
        </nav>
      </div>

      {/* Brokers Table */}
      {activeTab === 'brokers' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {brokers.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-sm font-medium text-gray-900">No brokers registered yet</h3>
              <p className="mt-1 text-sm text-gray-500">Brokers will appear here once they register.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Customers</th>
                    <th className="px-6 py-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {brokers.map((broker) => (
                    <tr key={broker.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{broker.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{broker.email}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {broker.customerCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(broker.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customers Table */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {customers.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-sm font-medium text-gray-900">No customers onboarded yet</h3>
              <p className="mt-1 text-sm text-gray-500">Customers will appear here once brokers onboard them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">GSTIN</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Broker</th>
                    <th className="px-6 py-3">Onboarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.fullName}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{customer.gstin}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.entityType === 'EXPORTER'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {customer.entityType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.broker.fullName}</td>
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
      )}
    </div>
  );
}
