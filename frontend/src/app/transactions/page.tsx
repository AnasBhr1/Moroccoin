'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, debounce } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Transaction {
  transaction_id: string;
  sender_name: string;
  receiver_name: string;
  sender_email: string;
  receiver_email: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | 'processing';
  transaction_type: 'send' | 'receive' | 'refund' | 'fee';
  created_at: string;
  updated_at: string;
  description: string;
  fee_amount: number;
  exchange_rate: number;
  reference_number: string;
  payment_method: string;
  country_from: string;
  country_to: string;
}

interface TransactionFilters {
  status: string;
  transaction_type: string;
  date_from: string;
  date_to: string;
  amount_min: string;
  amount_max: string;
  country: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const [filters, setFilters] = useState<TransactionFilters>({
    status: '',
    transaction_type: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
    country: '',
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to format currency
  const formatCurrencyLocal = (amount: number, currency = 'MAD') => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filters, sortBy, sortOrder]);

  const debouncedSearch = debounce((term: string) => {
    fetchTransactions(term);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchTransactions();
    }
  }, [searchTerm]);

  const fetchTransactions = async (search?: string) => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          transaction_id: 'TXN-001234',
          sender_name: 'Ahmed El Mansouri',
          receiver_name: 'Marie Dubois',
          sender_email: 'ahmed@email.com',
          receiver_email: 'marie@email.com',
          amount: 2500.00,
          currency: 'MAD',
          status: 'completed',
          transaction_type: 'send',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:35:00Z',
          description: 'Monthly allowance',
          fee_amount: 25.00,
          exchange_rate: 10.85,
          reference_number: 'REF-789456',
          payment_method: 'Bank Transfer',
          country_from: 'Morocco',
          country_to: 'France'
        },
        {
          transaction_id: 'TXN-001235',
          sender_name: 'Fatima Zahra',
          receiver_name: 'Carlos Rodriguez',
          sender_email: 'fatima@email.com',
          receiver_email: 'carlos@email.com',
          amount: 1200.50,
          currency: 'MAD',
          status: 'pending',
          transaction_type: 'send',
          created_at: '2024-01-15T09:15:00Z',
          updated_at: '2024-01-15T09:15:00Z',
          description: 'Tuition payment',
          fee_amount: 15.00,
          exchange_rate: 10.75,
          reference_number: 'REF-789457',
          payment_method: 'Credit Card',
          country_from: 'Morocco',
          country_to: 'Spain'
        },
        {
          transaction_id: 'TXN-001236',
          sender_name: 'Mohammed Benjelloun',
          receiver_name: 'Lisa Johnson',
          sender_email: 'mohammed@email.com',
          receiver_email: 'lisa@email.com',
          amount: 5000.00,
          currency: 'MAD',
          status: 'failed',
          transaction_type: 'send',
          created_at: '2024-01-14T16:45:00Z',
          updated_at: '2024-01-14T16:50:00Z',
          description: 'Business payment',
          fee_amount: 50.00,
          exchange_rate: 10.90,
          reference_number: 'REF-789458',
          payment_method: 'Bank Transfer',
          country_from: 'Morocco',
          country_to: 'USA'
        },
        {
          transaction_id: 'TXN-001237',
          sender_name: 'Youssef Alami',
          receiver_name: 'Anna Schmidt',
          sender_email: 'youssef@email.com',
          receiver_email: 'anna@email.com',
          amount: 800.75,
          currency: 'MAD',
          status: 'processing',
          transaction_type: 'send',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-14T14:25:00Z',
          description: 'Gift transfer',
          fee_amount: 10.00,
          exchange_rate: 10.80,
          reference_number: 'REF-789459',
          payment_method: 'Digital Wallet',
          country_from: 'Morocco',
          country_to: 'Germany'
        },
        {
          transaction_id: 'TXN-001238',
          sender_name: 'Aicha Benali',
          receiver_name: 'Roberto Silva',
          sender_email: 'aicha@email.com',
          receiver_email: 'roberto@email.com',
          amount: 3200.00,
          currency: 'MAD',
          status: 'completed',
          transaction_type: 'send',
          created_at: '2024-01-13T11:10:00Z',
          updated_at: '2024-01-13T11:15:00Z',
          description: 'Family support',
          fee_amount: 32.00,
          exchange_rate: 10.95,
          reference_number: 'REF-789460',
          payment_method: 'Bank Transfer',
          country_from: 'Morocco',
          country_to: 'Brazil'
        }
      ];

      // Filter transactions based on search and filters
      let filteredTransactions = mockTransactions;
      
      if (search) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
          t.sender_name.toLowerCase().includes(search.toLowerCase()) ||
          t.receiver_name.toLowerCase().includes(search.toLowerCase()) ||
          t.reference_number.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply filters
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      if (filters.transaction_type) {
        filteredTransactions = filteredTransactions.filter(t => t.transaction_type === filters.transaction_type);
      }
      if (filters.amount_min) {
        filteredTransactions = filteredTransactions.filter(t => t.amount >= parseFloat(filters.amount_min));
      }
      if (filters.amount_max) {
        filteredTransactions = filteredTransactions.filter(t => t.amount <= parseFloat(filters.amount_max));
      }

      setTransactions(filteredTransactions);
      setPagination({
        count: filteredTransactions.length,
        next: filteredTransactions.length > 10 ? 'next' : null,
        previous: currentPage > 1 ? 'prev' : null,
      });
    } catch (err: any) {
      setError('Failed to fetch transactions');
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      transaction_type: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      country: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const exportTransactions = () => {
    // Mock export functionality
    const csvContent = [
      ['Transaction ID', 'Sender', 'Receiver', 'Amount', 'Status', 'Date'].join(','),
      ...transactions.map(t => [
        t.transaction_id,
        t.sender_name,
        t.receiver_name,
        t.amount,
        t.status,
        formatDate(t.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-orange-600" />;
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600">
              Monitor and manage all platform transactions
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" onClick={exportTransactions}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="default" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="default" className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                  <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 border border-blue-200">
                  <CreditCardIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">1,156</p>
                  <p className="text-xs text-green-600 mt-1">93.7% success rate</p>
                </div>
                <div className="p-3 rounded-xl bg-green-100 border border-green-200">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">45</p>
                  <p className="text-xs text-orange-600 mt-1">Awaiting processing</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-100 border border-orange-200">
                  <ClockIcon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrencyLocal(2547890.50)}</p>
                  <p className="text-xs text-purple-600 mt-1">This month</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-100 border border-purple-200">
                  <BanknotesIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card variant="default">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search and Filter Toggle */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search by transaction ID, names, or reference..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FunnelIcon className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  {(Object.values(filters).some(v => v) || searchTerm) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear All
                    </Button>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.transaction_type}
                        onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="send">Send</option>
                        <option value="receive">Receive</option>
                        <option value="refund">Refund</option>
                        <option value="fee">Fee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        value={filters.amount_min}
                        onChange={(e) => handleFilterChange('amount_min', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount</label>
                      <input
                        type="number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10000.00"
                        value={filters.amount_max}
                        onChange={(e) => handleFilterChange('amount_max', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">All Transactions</CardTitle>
                <CardDescription className="text-gray-600">
                  {pagination.count} transactions found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading transactions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('transaction_id')}
                      >
                        Transaction ID
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('sender_name')}
                      >
                        Sender / Receiver
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('amount')}
                      >
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('created_at')}
                      >
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.transaction_id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.reference_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center">
                                <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                                {transaction.sender_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                → {transaction.receiver_name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {transaction.country_from} → {transaction.country_to}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrencyLocal(transaction.amount, transaction.currency)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Fee: {formatCurrencyLocal(transaction.fee_amount, transaction.currency)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(transaction.status)} className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span className="capitalize">{transaction.status}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 capitalize">{transaction.transaction_type}</div>
                            <div className="text-xs text-gray-500">{transaction.payment_method}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{formatDate(transaction.created_at)}</div>
                            <div className="text-xs text-gray-500">{formatDateTime(transaction.created_at).split(' ')[1]}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowDetails(true);
                            }}
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.count > 10 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {Math.min((currentPage - 1) * 10 + 1, pagination.count)} to{' '}
              {Math.min(currentPage * 10, pagination.count)} of {pagination.count} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!pagination.previous}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.next}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Transaction Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedTransaction.transaction_id}</h4>
                    <p className="text-sm text-gray-500">Reference: {selectedTransaction.reference_number}</p>
                  </div>
                  <Badge variant={getStatusVariant(selectedTransaction.status)} size="lg" className="flex items-center space-x-1">
                    {getStatusIcon(selectedTransaction.status)}
                    <span className="capitalize">{selectedTransaction.status}</span>
                  </Badge>
                </div>

                {/* Amount Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Transaction Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrencyLocal(selectedTransaction.amount, selectedTransaction.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fee Amount</p>
                      <p className="text-lg font-semibold text-gray-700">
                        {formatCurrencyLocal(selectedTransaction.fee_amount, selectedTransaction.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Total Amount</span>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrencyLocal(selectedTransaction.amount + selectedTransaction.fee_amount, selectedTransaction.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sender & Receiver Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Sender Information
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.sender_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.sender_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Country</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.country_from}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Receiver Information
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.receiver_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.receiver_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Country</p>
                        <p className="text-sm text-gray-900">{selectedTransaction.country_to}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-900">Transaction Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedTransaction.transaction_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <p className="text-sm text-gray-900">{selectedTransaction.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Exchange Rate</p>
                      <p className="text-sm text-gray-900">{selectedTransaction.exchange_rate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Currency</p>
                      <p className="text-sm text-gray-900">{selectedTransaction.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">{formatDateTime(selectedTransaction.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{formatDateTime(selectedTransaction.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedTransaction.description && (
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900">Description</h5>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      {selectedTransaction.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                  <Button variant="default">
                    Download Receipt
                  </Button>
                  {selectedTransaction.status === 'pending' && (
                    <Button variant="warning">
                      Process Transaction
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}