'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  UsersIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
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
  AreaChart,
  Area,
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

  // Helper function to format currency properly
  const formatCurrencyLocal = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration since API might not be available
      const mockStats: DashboardStats = {
        users: { total: 5, active: 5, verified: 3, recent: 2 },
        transactions: { total: 50, completed: 15, pending: 5, failed: 2, recent: 8 },
        financial: { total_volume: 14746.99, total_fees: 343.50, currency: 'MAD' },
        refunds: { pending: 2, total: 5 },
        top_countries: [
          { country: 'Morocco', count: 3 },
          { country: 'France', count: 1 },
          { country: 'Spain', count: 1 }
        ]
      };
      
      const mockChartData: ChartData = {
        daily_data: [
          { date: '2024-01-01', transactions: 5, volume: 2500 },
          { date: '2024-01-02', transactions: 8, volume: 4200 },
          { date: '2024-01-03', transactions: 12, volume: 6800 },
          { date: '2024-01-04', transactions: 6, volume: 3100 },
          { date: '2024-01-05', transactions: 15, volume: 8900 },
          { date: '2024-01-06', transactions: 10, volume: 5400 },
          { date: '2024-01-07', transactions: 18, volume: 12000 }
        ],
        status_distribution: [
          { status: 'Completed', count: 15 },
          { status: 'Pending', count: 5 },
          { status: 'Failed', count: 2 }
        ]
      };

      setStats(mockStats);
      setChartData(mockChartData);
    } catch (err: any) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="default" className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      change: '+12%',
      changeType: 'increase' as const,
      icon: UsersIcon,
      description: `${stats?.users.active || 0} active users`,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      name: 'Transactions',
      value: stats?.transactions.total || 0,
      change: '+8%',
      changeType: 'increase' as const,
      icon: CreditCardIcon,
      description: `${stats?.transactions.completed || 0} completed`,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      name: 'Total Volume',
      value: formatCurrencyLocal(stats?.financial.total_volume || 0),
      change: '+15%',
      changeType: 'increase' as const,
      icon: BanknotesIcon,
      description: `${formatCurrencyLocal(stats?.financial.total_fees || 0)} fees`,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      name: 'Pending Refunds',
      value: stats?.refunds.pending || 0,
      change: '-5%',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      description: `${stats?.refunds.total || 0} total refunds`,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
  ];

  const pieColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back! 👋
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your platform today.
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Badge variant="success" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>All systems operational</span>
            </Badge>
            <Button variant="outline" size="sm">
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <Card 
              key={card.name} 
              variant="default"
              className={`${card.bgColor} ${card.borderColor} border-2 hover:shadow-lg transition-all duration-300`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {card.name}
                    </p>
                    <div className="flex items-baseline space-x-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {card.value}
                      </h3>
                      <div className={`flex items-center text-sm font-semibold ${
                        card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {card.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {card.change}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {card.description}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-xl ${card.bgColor} border ${card.borderColor}`}>
                    <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Transaction Trend Chart */}
          <Card variant="default" className="xl:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">Transaction Trends</CardTitle>
                  <CardDescription className="text-gray-600">Daily transaction volume and count over the last 30 days</CardDescription>
                </div>
                <Badge variant="outline">Last 30 days</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData?.daily_data || []}>
                    <defs>
                      <linearGradient id="transactionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: any, name: string) => [
                        name === 'volume' ? formatCurrencyLocal(value) : value,
                        name === 'volume' ? 'Volume' : 'Transactions'
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      stroke="#22c55e"
                      strokeWidth={3}
                      fill="url(#transactionGradient)"
                    />
                    <Area
                      type="monotone"
                      dataKey="volume"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#volumeGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Status Distribution */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Status Distribution</CardTitle>
              <CardDescription className="text-gray-600">Transaction status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData?.status_distribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => {
                        const percentage = (percent * 100).toFixed(0);
                        return `${status} ${percentage}%`;
                      }}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {chartData?.status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-gray-900">
                <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
                Quick Insights
              </CardTitle>
              <CardDescription className="text-gray-600">Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{stats?.users.active}</div>
                  <div className="text-sm text-gray-600">Active Users</div>
                  <div className="text-xs text-blue-600 mt-1">+{stats?.users.recent || 0} this week</div>
                </div>
                
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{stats?.users.verified}</div>
                  <div className="text-sm text-gray-600">Verified Users</div>
                  <div className="text-xs text-green-600 mt-1">
                    {((stats?.users.verified || 0) / (stats?.users.total || 1) * 100).toFixed(1)}% verified
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">{stats?.transactions.completed}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {((stats?.transactions.completed || 0) / (stats?.transactions.total || 1) * 100).toFixed(1)}% success
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
                  <div className="text-2xl font-bold text-orange-600">{stats?.transactions.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                  <div className="text-xs text-orange-600 mt-1">Needs attention</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">Total Fees Collected</span>
                  <Badge variant="success" size="sm">
                    {formatCurrencyLocal(stats?.financial.total_fees || 0)}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">75% of monthly target</div>
              </div>
            </CardContent>
          </Card>

          {/* Top Countries */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-gray-900">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-blue-600" />
                Top Countries
              </CardTitle>
              <CardDescription className="text-gray-600">User distribution by location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.top_countries.map((country, index) => (
                <div key={country.country} className="flex items-center justify-between group hover:bg-gray-50 p-3 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{country.country}</p>
                      <p className="text-sm text-gray-500">{country.count} users</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${(country.count / (stats?.top_countries[0]?.count || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <Badge variant="outline" size="sm">
                      {((country.count / (stats?.users.total || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!stats?.top_countries || stats.top_countries.length === 0) && (
                <div className="text-center py-8">
                  <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No country data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}