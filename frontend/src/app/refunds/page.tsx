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
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

interface Refund {
  refund_id: string;
  transaction_id: string;
  user_name: string;
  user_email: string;
  original_amount: number;
  refund_amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes: string;
  supporting_documents: string[];
  refund_method: string;
  estimated_completion: string;
  contact_attempts: number;
}

interface RefundFilters {
  status: string;
  priority: string;
  date_from: string;
  date_to: string;
  amount_min: string;
  amount_max: string;
  refund_method: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showManualRefundModal, setShowManualRefundModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  // Manual refund form state
  const [manualRefundForm, setManualRefundForm] = useState({
    transaction_id: '',
    user_email: '',
    user_name: '',
    original_amount: '',
    refund_amount: '',
    currency: 'MAD',
    reason: '',
    priority: 'medium',
    refund_method: 'Bank Transfer',
    admin_notes: '',
    estimated_completion: '',
  });
  const [manualRefundErrors, setManualRefundErrors] = useState<Record<string, string>>({});
  const [creatingManualRefund, setCreatingManualRefund] = useState(false);
  const [searchingTransaction, setSearchingTransaction] = useState(false);
  const [transactionFound, setTransactionFound] = useState<any>(null);
  
  const [filters, setFilters] = useState<RefundFilters>({
    status: '',
    priority: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
    refund_method: '',
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
    fetchRefunds();
  }, [currentPage, filters, sortBy, sortOrder]);

  const debouncedSearch = debounce((term: string) => {
    fetchRefunds(term);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchRefunds();
    }
  }, [searchTerm]);

  const fetchRefunds = async (search?: string) => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockRefunds: Refund[] = [
        {
          refund_id: 'REF-001234',
          transaction_id: 'TXN-001234',
          user_name: 'Ahmed El Mansouri',
          user_email: 'ahmed@email.com',
          original_amount: 2500.00,
          refund_amount: 2500.00,
          currency: 'MAD',
          reason: 'Transaction failed to complete due to recipient bank issues',
          status: 'pending',
          priority: 'high',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          admin_notes: '',
          supporting_documents: ['receipt.pdf', 'bank_statement.pdf'],
          refund_method: 'Bank Transfer',
          estimated_completion: '2024-01-18T10:30:00Z',
          contact_attempts: 1
        },
        {
          refund_id: 'REF-001235',
          transaction_id: 'TXN-001235',
          user_name: 'Fatima Zahra',
          user_email: 'fatima@email.com',
          original_amount: 1200.50,
          refund_amount: 1185.50,
          currency: 'MAD',
          reason: 'Duplicate transaction charged twice',
          status: 'approved',
          priority: 'medium',
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-15T11:20:00Z',
          processed_at: '2024-01-15T11:20:00Z',
          processed_by: 'Admin User',
          admin_notes: 'Verified duplicate charge. Processing refund minus transaction fee.',
          supporting_documents: ['duplicate_charge_proof.png'],
          refund_method: 'Original Payment Method',
          estimated_completion: '2024-01-17T09:15:00Z',
          contact_attempts: 2
        },
        {
          refund_id: 'REF-001236',
          transaction_id: 'TXN-001236',
          user_name: 'Mohammed Benjelloun',
          user_email: 'mohammed@email.com',
          original_amount: 5000.00,
          refund_amount: 4950.00,
          currency: 'MAD',
          reason: 'Service not delivered as promised',
          status: 'processing',
          priority: 'urgent',
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          processed_at: '2024-01-15T14:30:00Z',
          processed_by: 'Admin User',
          admin_notes: 'Large amount refund. Requires additional verification. Contacted compliance team.',
          supporting_documents: ['service_agreement.pdf', 'complaint_details.pdf'],
          refund_method: 'Bank Transfer',
          estimated_completion: '2024-01-20T16:45:00Z',
          contact_attempts: 3
        },
        {
          refund_id: 'REF-001237',
          transaction_id: 'TXN-001237',
          user_name: 'Youssef Alami',
          user_email: 'youssef@email.com',
          original_amount: 800.75,
          refund_amount: 800.75,
          currency: 'MAD',
          reason: 'Unauthorized transaction',
          status: 'rejected',
          priority: 'high',
          created_at: '2024-01-12T14:20:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          processed_at: '2024-01-14T16:45:00Z',
          processed_by: 'Admin User',
          admin_notes: 'Investigation showed transaction was authorized by account holder. Provided evidence to customer.',
          supporting_documents: ['authorization_log.txt'],
          refund_method: 'N/A',
          estimated_completion: 'N/A',
          contact_attempts: 4
        },
        {
          refund_id: 'REF-001238',
          transaction_id: 'TXN-001238',
          user_name: 'Aicha Benali',
          user_email: 'aicha@email.com',
          original_amount: 3200.00,
          refund_amount: 3200.00,
          currency: 'MAD',
          reason: 'Cancelled order before processing',
          status: 'completed',
          priority: 'low',
          created_at: '2024-01-10T11:10:00Z',
          updated_at: '2024-01-12T09:30:00Z',
          processed_at: '2024-01-11T15:20:00Z',
          processed_by: 'Admin User',
          admin_notes: 'Standard cancellation refund. Processed successfully.',
          supporting_documents: ['cancellation_request.pdf'],
          refund_method: 'Original Payment Method',
          estimated_completion: '2024-01-14T11:10:00Z',
          contact_attempts: 1
        }
      ];

      // Filter refunds based on search and filters
      let filteredRefunds = mockRefunds;
      
      if (search) {
        filteredRefunds = filteredRefunds.filter(r =>
          r.refund_id.toLowerCase().includes(search.toLowerCase()) ||
          r.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
          r.user_name.toLowerCase().includes(search.toLowerCase()) ||
          r.user_email.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply filters
      if (filters.status) {
        filteredRefunds = filteredRefunds.filter(r => r.status === filters.status);
      }
      if (filters.priority) {
        filteredRefunds = filteredRefunds.filter(r => r.priority === filters.priority);
      }
      if (filters.amount_min) {
        filteredRefunds = filteredRefunds.filter(r => r.refund_amount >= parseFloat(filters.amount_min));
      }
      if (filters.amount_max) {
        filteredRefunds = filteredRefunds.filter(r => r.refund_amount <= parseFloat(filters.amount_max));
      }

      setRefunds(filteredRefunds);
      setPagination({
        count: filteredRefunds.length,
        next: filteredRefunds.length > 10 ? 'next' : null,
        previous: currentPage > 1 ? 'prev' : null,
      });
    } catch (err: any) {
      setError('Failed to fetch refunds');
      console.error('Refunds fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof RefundFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
      refund_method: '',
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

  const exportRefunds = () => {
    const csvContent = [
      ['Refund ID', 'Transaction ID', 'User', 'Amount', 'Status', 'Priority', 'Date'].join(','),
      ...refunds.map(r => [
        r.refund_id,
        r.transaction_id,
        r.user_name,
        r.refund_amount,
        r.status,
        r.priority,
        formatDate(r.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'refunds.csv';
    a.click();
  };

  const processRefund = async (action: 'approve' | 'reject') => {
    if (!selectedRefund) return;
    
    setProcessing(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the refund status
      const updatedRefunds = refunds.map(r => 
        r.refund_id === selectedRefund.refund_id 
          ? { 
              ...r, 
              status: action === 'approve' ? 'approved' : 'rejected' as any,
              admin_notes: adminNotes,
              processed_at: new Date().toISOString(),
              processed_by: 'Current Admin'
            }
          : r
      );
      
      setRefunds(updatedRefunds);
      setShowProcessModal(false);
      setAdminNotes('');
      setActionType(null);
      
      // Update selected refund if details modal is open
      if (showDetails) {
        const updatedRefund = updatedRefunds.find(r => r.refund_id === selectedRefund.refund_id);
        if (updatedRefund) {
          setSelectedRefund(updatedRefund);
        }
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setProcessing(false);
    }
  };

  const searchTransaction = async (transactionId: string) => {
    if (!transactionId) return;
    
    setSearchingTransaction(true);
    try {
      // Mock API call to search transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction data
      const mockTransaction = {
        transaction_id: transactionId,
        sender_name: 'Ahmed El Mansouri',
        sender_email: 'ahmed@email.com',
        receiver_name: 'Marie Dubois',
        amount: 2500.00,
        currency: 'MAD',
        status: 'completed',
        created_at: '2024-01-15T10:30:00Z',
        fee_amount: 25.00,
      };
      
      setTransactionFound(mockTransaction);
      setManualRefundForm(prev => ({
        ...prev,
        user_name: mockTransaction.sender_name,
        user_email: mockTransaction.sender_email,
        original_amount: mockTransaction.amount.toString(),
        refund_amount: mockTransaction.amount.toString(),
        currency: mockTransaction.currency,
      }));
    } catch (error) {
      console.error('Error searching transaction:', error);
      setTransactionFound(null);
    } finally {
      setSearchingTransaction(false);
    }
  };

  const validateManualRefundForm = () => {
    const errors: Record<string, string> = {};
    
    if (!manualRefundForm.transaction_id.trim()) {
      errors.transaction_id = 'Transaction ID is required';
    }
    if (!manualRefundForm.user_email.trim()) {
      errors.user_email = 'User email is required';
    } else if (!/\S+@\S+\.\S+/.test(manualRefundForm.user_email)) {
      errors.user_email = 'Please enter a valid email address';
    }
    if (!manualRefundForm.user_name.trim()) {
      errors.user_name = 'User name is required';
    }
    if (!manualRefundForm.original_amount.trim()) {
      errors.original_amount = 'Original amount is required';
    } else if (isNaN(parseFloat(manualRefundForm.original_amount)) || parseFloat(manualRefundForm.original_amount) <= 0) {
      errors.original_amount = 'Please enter a valid amount';
    }
    if (!manualRefundForm.refund_amount.trim()) {
      errors.refund_amount = 'Refund amount is required';
    } else if (isNaN(parseFloat(manualRefundForm.refund_amount)) || parseFloat(manualRefundForm.refund_amount) <= 0) {
      errors.refund_amount = 'Please enter a valid refund amount';
    } else if (parseFloat(manualRefundForm.refund_amount) > parseFloat(manualRefundForm.original_amount)) {
      errors.refund_amount = 'Refund amount cannot exceed original amount';
    }
    if (!manualRefundForm.reason.trim()) {
      errors.reason = 'Refund reason is required';
    }
    
    setManualRefundErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createManualRefund = async () => {
    if (!validateManualRefundForm()) return;
    
    setCreatingManualRefund(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new refund
      const newRefund: Refund = {
        refund_id: `REF-${Date.now().toString().slice(-6)}`,
        transaction_id: manualRefundForm.transaction_id,
        user_name: manualRefundForm.user_name,
        user_email: manualRefundForm.user_email,
        original_amount: parseFloat(manualRefundForm.original_amount),
        refund_amount: parseFloat(manualRefundForm.refund_amount),
        currency: manualRefundForm.currency,
        reason: manualRefundForm.reason,
        status: 'approved',
        priority: manualRefundForm.priority as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        processed_at: new Date().toISOString(),
        processed_by: 'Current Admin',
        admin_notes: `Manual refund created. ${manualRefundForm.admin_notes}`,
        supporting_documents: [],
        refund_method: manualRefundForm.refund_method,
        estimated_completion: manualRefundForm.estimated_completion || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        contact_attempts: 0
      };
      
      // Add to refunds list
      setRefunds(prev => [newRefund, ...prev]);
      
      // Reset form and close modal
      setManualRefundForm({
        transaction_id: '',
        user_email: '',
        user_name: '',
        original_amount: '',
        refund_amount: '',
        currency: 'MAD',
        reason: '',
        priority: 'medium',
        refund_method: 'Bank Transfer',
        admin_notes: '',
        estimated_completion: '',
      });
      setTransactionFound(null);
      setManualRefundErrors({});
      setShowManualRefundModal(false);
      
    } catch (error) {
      console.error('Error creating manual refund:', error);
    } finally {
      setCreatingManualRefund(false);
    }
  };

  const handleManualRefundFormChange = (field: string, value: string) => {
    setManualRefundForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (manualRefundErrors[field]) {
      setManualRefundErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Auto-calculate refund amount if original amount changes
    if (field === 'original_amount' && value && !isNaN(parseFloat(value))) {
      setManualRefundForm(prev => ({ ...prev, refund_amount: value }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-orange-600" />;
      case 'processing':
        return <ArrowPathIcon className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'outline' | 'info' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'approved':
        return 'info';
      case 'pending':
      case 'processing':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'destructive' | 'outline' => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'outline';
      case 'low':
        return 'success';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-gray-600">
              Process and manage customer refund requests
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" onClick={exportRefunds}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowManualRefundModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Manual Refund
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="default" className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <ArrowPathIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">145</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrencyLocal(125430.50)}</p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-purple-600" />
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
                      placeholder="Search by refund ID, transaction ID, or user name..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.priority}
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                      >
                        <option value="">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
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

        {/* Refunds Table */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Refund Requests</CardTitle>
                <CardDescription className="text-gray-600">
                  {pagination.count} refund requests found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading refunds...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              </div>
            ) : refunds.length === 0 ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No refunds found</h3>
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
                        onClick={() => handleSort('refund_id')}
                      >
                        Refund ID
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('user_name')}
                      >
                        Customer
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('refund_amount')}
                      >
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
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
                    {refunds.map((refund) => (
                      <tr key={refund.refund_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {refund.refund_id}
                            </div>
                            <div className="text-sm text-gray-500">
                              TXN: {refund.transaction_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrencyLocal(refund.refund_amount, refund.currency)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Original: {formatCurrencyLocal(refund.original_amount, refund.currency)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {refund.refund_method}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(refund.status)} className="flex items-center space-x-1 w-fit">
                            {getStatusIcon(refund.status)}
                            <span className="capitalize">{refund.status}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={getPriorityVariant(refund.priority)} 
                            className={`capitalize ${getPriorityColor(refund.priority)}`}
                          >
                            {refund.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{formatDate(refund.created_at)}</div>
                            <div className="text-xs text-gray-500">{formatDateTime(refund.created_at).split(' ')[1]}</div>
                            {refund.estimated_completion && refund.status !== 'rejected' && refund.status !== 'completed' && (
                              <div className="text-xs text-blue-600">
                                Est: {formatDate(refund.estimated_completion)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRefund(refund);
                                setShowDetails(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {refund.status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRefund(refund);
                                    setActionType('approve');
                                    setShowProcessModal(true);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRefund(refund);
                                    setActionType('reject');
                                    setShowProcessModal(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
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

        {/* Refund Details Modal */}
        {showDetails && selectedRefund && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Refund Request Details</h3>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Refund Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedRefund.refund_id}</h4>
                    <p className="text-sm text-gray-500">Transaction: {selectedRefund.transaction_id}</p>
                    <p className="text-sm text-gray-500">Created: {formatDateTime(selectedRefund.created_at)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusVariant(selectedRefund.status)} size="lg" className="flex items-center space-x-1">
                      {getStatusIcon(selectedRefund.status)}
                      <span className="capitalize">{selectedRefund.status}</span>
                    </Badge>
                    <Badge 
                      variant={getPriorityVariant(selectedRefund.priority)} 
                      size="lg"
                      className={`capitalize ${getPriorityColor(selectedRefund.priority)}`}
                    >
                      {selectedRefund.priority} Priority
                    </Badge>
                  </div>
                </div>

                {/* Amount Details */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Refund Amount Details</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Original Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrencyLocal(selectedRefund.original_amount, selectedRefund.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Refund Amount</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrencyLocal(selectedRefund.refund_amount, selectedRefund.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Refund Method</p>
                      <p className="text-sm text-gray-900">{selectedRefund.refund_method}</p>
                    </div>
                  </div>
                  {selectedRefund.estimated_completion && selectedRefund.status !== 'rejected' && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-500">Estimated Completion</p>
                      <p className="text-sm text-blue-600">{formatDateTime(selectedRefund.estimated_completion)}</p>
                    </div>
                  )}
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Customer Information
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-sm text-gray-900">{selectedRefund.user_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{selectedRefund.user_email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Attempts</p>
                        <p className="text-sm text-gray-900">{selectedRefund.contact_attempts} times</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Timeline
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Request Created</p>
                        <p className="text-sm text-gray-900">{formatDateTime(selectedRefund.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Updated</p>
                        <p className="text-sm text-gray-900">{formatDateTime(selectedRefund.updated_at)}</p>
                      </div>
                      {selectedRefund.processed_at && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Processed</p>
                          <p className="text-sm text-gray-900">{formatDateTime(selectedRefund.processed_at)}</p>
                          {selectedRefund.processed_by && (
                            <p className="text-xs text-gray-500">by {selectedRefund.processed_by}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Refund Reason */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-900">Refund Reason</h5>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                    {selectedRefund.reason}
                  </p>
                </div>

                {/* Supporting Documents */}
                {selectedRefund.supporting_documents.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Supporting Documents
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedRefund.supporting_documents.map((doc, index) => (
                        <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc}</p>
                            <p className="text-xs text-gray-500">Document {index + 1}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedRefund.admin_notes && (
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-900 flex items-center">
                      <ChatBubbleLeftIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Admin Notes
                    </h5>
                    <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-200">
                      {selectedRefund.admin_notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={() => setShowDetails(false)}>
                      Close
                    </Button>
                    <Button variant="outline">
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                      Contact Customer
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {selectedRefund.status === 'pending' && (
                      <>
                        <Button 
                          variant="destructive"
                          onClick={() => {
                            setActionType('reject');
                            setShowProcessModal(true);
                          }}
                        >
                          Reject Request
                        </Button>
                        <Button 
                          variant="success"
                          onClick={() => {
                            setActionType('approve');
                            setShowProcessModal(true);
                          }}
                        >
                          Approve Refund
                        </Button>
                      </>
                    )}
                    {(selectedRefund.status === 'approved' || selectedRefund.status === 'completed') && (
                      <Button variant="default">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manual Refund Modal */}
        {showManualRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Create Manual Refund</h3>
                  <button
                    onClick={() => {
                      setShowManualRefundModal(false);
                      setManualRefundForm({
                        transaction_id: '',
                        user_email: '',
                        user_name: '',
                        original_amount: '',
                        refund_amount: '',
                        currency: 'MAD',
                        reason: '',
                        priority: 'medium',
                        refund_method: 'Bank Transfer',
                        admin_notes: '',
                        estimated_completion: '',
                      });
                      setTransactionFound(null);
                      setManualRefundErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Transaction Lookup */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Transaction Lookup</h4>
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          manualRefundErrors.transaction_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="TXN-001234"
                        value={manualRefundForm.transaction_id}
                        onChange={(e) => handleManualRefundFormChange('transaction_id', e.target.value)}
                      />
                      {manualRefundErrors.transaction_id && (
                        <p className="mt-1 text-sm text-red-600">{manualRefundErrors.transaction_id}</p>
                      )}
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => searchTransaction(manualRefundForm.transaction_id)}
                        disabled={!manualRefundForm.transaction_id || searchingTransaction}
                        loading={searchingTransaction}
                      >
                        {searchingTransaction ? 'Searching...' : 'Lookup'}
                      </Button>
                    </div>
                  </div>
                  
                  {transactionFound && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Transaction Found</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Sender:</span> {transactionFound.sender_name}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Amount:</span> {formatCurrencyLocal(transactionFound.amount, transactionFound.currency)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Status:</span> 
                          <Badge variant="success" size="sm" className="ml-2">{transactionFound.status}</Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Date:</span> {formatDate(transactionFound.created_at)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          manualRefundErrors.user_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="John Doe"
                        value={manualRefundForm.user_name}
                        onChange={(e) => handleManualRefundFormChange('user_name', e.target.value)}
                      />
                      {manualRefundErrors.user_name && (
                        <p className="mt-1 text-sm text-red-600">{manualRefundErrors.user_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          manualRefundErrors.user_email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="john@example.com"
                        value={manualRefundForm.user_email}
                        onChange={(e) => handleManualRefundFormChange('user_email', e.target.value)}
                      />
                      {manualRefundErrors.user_email && (
                        <p className="mt-1 text-sm text-red-600">{manualRefundErrors.user_email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Refund Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Refund Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Amount <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            manualRefundErrors.original_amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                          }`}
                          placeholder="1000.00"
                          value={manualRefundForm.original_amount}
                          onChange={(e) => handleManualRefundFormChange('original_amount', e.target.value)}
                        />
                      </div>
                      {manualRefundErrors.original_amount && (
                        <p className="mt-1 text-sm text-red-600">{manualRefundErrors.original_amount}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          manualRefundErrors.refund_amount ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="1000.00"
                        value={manualRefundForm.refund_amount}
                        onChange={(e) => handleManualRefundFormChange('refund_amount', e.target.value)}
                      />
                      {manualRefundErrors.refund_amount && (
                        <p className="mt-1 text-sm text-red-600">{manualRefundErrors.refund_amount}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={manualRefundForm.currency}
                        onChange={(e) => handleManualRefundFormChange('currency', e.target.value)}
                      >
                        <option value="MAD">MAD - Moroccan Dirham</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Refund Configuration */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Refund Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={manualRefundForm.priority}
                        onChange={(e) => handleManualRefundFormChange('priority', e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Refund Method</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={manualRefundForm.refund_method}
                        onChange={(e) => handleManualRefundFormChange('refund_method', e.target.value)}
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Original Payment Method">Original Payment Method</option>
                        <option value="Digital Wallet">Digital Wallet</option>
                        <option value="Check">Check</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Reason and Notes */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        manualRefundErrors.reason ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      rows={3}
                      placeholder="Provide detailed reason for this manual refund..."
                      value={manualRefundForm.reason}
                      onChange={(e) => handleManualRefundFormChange('reason', e.target.value)}
                    />
                    {manualRefundErrors.reason && (
                      <p className="mt-1 text-sm text-red-600">{manualRefundErrors.reason}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Additional notes for internal reference..."
                      value={manualRefundForm.admin_notes}
                      onChange={(e) => handleManualRefundFormChange('admin_notes', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Completion Date</label>
                    <input
                      type="datetime-local"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={manualRefundForm.estimated_completion}
                      onChange={(e) => handleManualRefundFormChange('estimated_completion', e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">If not specified, will default to 3 business days from now</p>
                  </div>
                </div>

                {/* Summary */}
                {manualRefundForm.refund_amount && manualRefundForm.user_name && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-2">Refund Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-700">Customer:</span> {manualRefundForm.user_name}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Refund Amount:</span> {formatCurrencyLocal(parseFloat(manualRefundForm.refund_amount), manualRefundForm.currency)}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Method:</span> {manualRefundForm.refund_method}
                      </div>
                      <div>
                        <span className="font-medium text-blue-700">Priority:</span> 
                        <Badge variant={getPriorityVariant(manualRefundForm.priority)} size="sm" className="ml-2 capitalize">
                          {manualRefundForm.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowManualRefundModal(false);
                        setManualRefundForm({
                          transaction_id: '',
                          user_email: '',
                          user_name: '',
                          original_amount: '',
                          refund_amount: '',
                          currency: 'MAD',
                          reason: '',
                          priority: 'medium',
                          refund_method: 'Bank Transfer',
                          admin_notes: '',
                          estimated_completion: '',
                        });
                        setTransactionFound(null);
                        setManualRefundErrors({});
                      }}
                      disabled={creatingManualRefund}
                    >
                      Cancel
                    </Button>
                    <Button variant="ghost">
                      Save as Draft
                    </Button>
                  </div>
                  
                  <Button
                    variant="success"
                    onClick={createManualRefund}
                    disabled={creatingManualRefund}
                    loading={creatingManualRefund}
                  >
                    {creatingManualRefund ? 'Creating Refund...' : 'Create & Approve Refund'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Refund Modal */}
        {showProcessModal && selectedRefund && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {actionType === 'approve' ? 'Approve Refund' : 'Reject Refund'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProcessModal(false);
                      setAdminNotes('');
                      setActionType(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{selectedRefund.refund_id}</h4>
                  <p className="text-sm text-gray-600">{selectedRefund.user_name}</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrencyLocal(selectedRefund.refund_amount, selectedRefund.currency)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes {actionType === 'reject' ? '(Required)' : '(Optional)'}
                  </label>
                  <textarea
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder={actionType === 'approve' 
                      ? "Add any notes about the approval..." 
                      : "Please provide a reason for rejection..."
                    }
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required={actionType === 'reject'}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowProcessModal(false);
                      setAdminNotes('');
                      setActionType(null);
                    }}
                    disabled={processing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === 'approve' ? 'success' : 'destructive'}
                    onClick={() => processRefund(actionType)}
                    disabled={processing || (actionType === 'reject' && !adminNotes.trim())}
                    loading={processing}
                  >
                    {processing 
                      ? `${actionType === 'approve' ? 'Approving' : 'Rejecting'}...`
                      : `${actionType === 'approve' ? 'Approve' : 'Reject'} Refund`
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}