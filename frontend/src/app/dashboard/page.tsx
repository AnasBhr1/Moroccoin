'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  UsersIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    verified: number;
    recent: number;
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    recent: number;
  };
  financial: {
    total_volume: number;
    total_fees: number;
    currency: string;
  };
  refunds: {
    pending: number;
    total: number;
  };
  top_countries: Array<{
    country: string;
    count: number;
  }>;
}

interface ChartData {
  daily_data: Array<{
    date: string;
    transactions: number;
    volume: number;
  }>;
  status_distribution: Array<{
    status: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, chartResponse] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getChartData({ days: 30 }),
      ]);
      
      setStats(statsResponse);
      setChartData(chartResponse);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      change: '+12%',
      changeType: 'increase',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Transactions',
      value: stats?.transactions.total || 0,
      change: '+8%',
      changeType: 'increase',
      icon: CreditCardIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Volume',
      value: formatCurrency(stats?.financial.total_volume || 0),
      change: '+15%',
      changeType: 'increase',
      icon: BanknotesIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Pending Refunds',
      value: stats?.refunds.pending || 0,
      change: '-5%',
      changeType: 'decrease',
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
    },
  ];

  const pieColors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your Moroccoin admin portal
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow-soft rounded-lg hover:shadow-medium transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.changeType === 'increase' ? (
                          <TrendingUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" />
                        ) : (
                          <TrendingDownIcon className="self-center flex-shrink-0 h-5 w-5 text-red-500" />
                        )}
                        <span className="ml-1">{card.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trend Chart */}
        <div className="bg-white p-6 shadow-soft rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Transaction Trends (Last 30 Days)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData?.daily_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: any, name: string) => [
                    name === 'volume' ? formatCurrency(value) : value,
                    name === 'volume' ? 'Volume' : 'Transactions'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transaction Status Distribution */}
        <div className="bg-white p-6 shadow-soft rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Transaction Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData?.status_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData?.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Stats */}
        <div className="bg-white shadow-soft rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
          <dl className="space-y-4">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Active Users</dt>
              <dd className="text-sm text-gray-900">{stats?.users.active}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Verified Users</dt>
              <dd className="text-sm text-gray-900">{stats?.users.verified}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Completed Transactions</dt>
              <dd className="text-sm text-gray-900">{stats?.transactions.completed}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Pending Transactions</dt>
              <dd className="text-sm text-gray-900">{stats?.transactions.pending}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">Total Fees Collected</dt>
              <dd className="text-sm text-gray-900">{formatCurrency(stats?.financial.total_fees || 0)}</dd>
            </div>
          </dl>
        </div>

        {/* Top Countries */}
        <div className="bg-white shadow-soft rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
          <div className="space-y-3">
            {stats?.top_countries.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{country.country}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {country.count} users
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}