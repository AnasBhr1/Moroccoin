'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  UsersIcon,
  CreditCardIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
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
  BarChart,
  Bar,
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
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <Card variant="gradient" className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <ExclamationTriangleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Dashboard</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={fetchDashboardData} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </Layout>
      </ProtectedRoute>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.users.total || 0,
      change: '+12%',
      changeType: 'increase' as const,
      icon: UsersIcon,
      gradient: 'from-blue-500 to-blue-600',
      description: `${stats?.users.active || 0} active users`,
      trend: stats?.users.recent || 0,
    },
    {
      name: 'Transactions',
      value: stats?.transactions.total || 0,
      change: '+8%',
      changeType: 'increase' as const,
      icon: CreditCardIcon,
      gradient: 'from-green-500 to-green-600',
      description: `${stats?.transactions.completed || 0} completed`,
      trend: stats?.transactions.recent || 0,
    },
    {
      name: 'Total Volume',
      value: formatCurrency(stats?.financial.total_volume || 0),
      change: '+15%',
      changeType: 'increase' as const,
      icon: BanknotesIcon,
      gradient: 'from-purple-500 to-purple-600',
      description: `${formatCurrency(stats?.financial.total_fees || 0)} fees`,
      trend: stats?.financial.total_volume || 0,
    },
    {
      name: 'Pending Refunds',
      value: stats?.refunds.pending || 0,
      change: '-5%',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      gradient: 'from-orange-500 to-orange-600',
      description: `${stats?.refunds.total || 0} total refunds`,
      trend: stats?.refunds.pending || 0,
    },
  ];

  const pieColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back! 👋
              </h1>
              <p className="text-muted-foreground">
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
                variant="glass"
                className="group hover:scale-105 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.name}
                      </p>
                      <div className="flex items-baseline space-x-2">
                        <h3 className="text-2xl font-bold text-foreground">
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
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Transaction Trend Chart */}
            <Card variant="glass" className="xl:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Transaction Trends</CardTitle>
                    <CardDescription>Daily transaction volume and count over the last 30 days</CardDescription>
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
                          name === 'volume' ? formatCurrency(value) : value,
                          name === 'volume' ? 'Volume' : 'Transactions'
                        ]}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
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
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-xl">Status Distribution</CardTitle>
                <CardDescription>Transaction status breakdown</CardDescription>
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
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
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
                          border: 'none',
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

          {/* Recent Activity and Top Countries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-primary" />
                  Quick Insights
                </CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                    <div className="text-2xl font-bold text-blue-600">{stats?.users.active}</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="text-xs text-blue-600 mt-1">+{stats?.users.recent || 0} this week</div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                    <div className="text-2xl font-bold text-green-600">{stats?.users.verified}</div>
                    <div className="text-sm text-muted-foreground">Verified Users</div>
                    <div className="text-xs text-green-600 mt-1">
                      {((stats?.users.verified || 0) / (stats?.users.total || 1) * 100).toFixed(1)}% verified
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                    <div className="text-2xl font-bold text-purple-600">{stats?.transactions.completed}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="text-xs text-purple-600 mt-1">
                      {((stats?.transactions.completed || 0) / (stats?.transactions.total || 1) * 100).toFixed(1)}% success
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-600">{stats?.transactions.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-xs text-orange-600 mt-1">Needs attention</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-foreground">Total Fees Collected</span>
                    <Badge variant="success" size="sm">
                      {formatCurrency(stats?.financial.total_fees || 0)}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">75% of monthly target</div>
                </div>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <GlobeAltIcon className="h-5 w-5 mr-2 text-primary" />
                  Top Countries
                </CardTitle>
                <CardDescription>User distribution by location</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats?.top_countries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between group hover:bg-muted/30 p-3 rounded-xl transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-sm">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{country.country}</p>
                        <p className="text-sm text-muted-foreground">{country.count} users</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500" 
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
                    <GlobeAltIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No country data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Feed */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and user actions</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    type: 'user_signup',
                    message: 'New user registered from Morocco',
                    time: '2 minutes ago',
                    icon: UsersIcon,
                    color: 'text-green-500',
                    bg: 'bg-green-500/10',
                  },
                  {
                    type: 'transaction',
                    message: 'Large transaction completed: $5,234',
                    time: '5 minutes ago',
                    icon: CreditCardIcon,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                  },
                  {
                    type: 'refund',
                    message: 'Refund request processed successfully',
                    time: '12 minutes ago',
                    icon: ExclamationTriangleIcon,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/10',
                  },
                  {
                    type: 'verification',
                    message: '3 users completed verification',
                    time: '25 minutes ago',
                    icon: UsersIcon,
                    color: 'text-purple-500',
                    bg: 'bg-purple-500/10',
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200 group">
                    <div className={`p-2 rounded-lg ${activity.bg} group-hover:scale-110 transition-transform duration-300`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}