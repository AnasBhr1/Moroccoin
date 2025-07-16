'use client';

import React, { useEffect, useState } from 'react';
import { formatDate, formatDateTime, debounce } from '@/lib/utils';
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
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PaperClipIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  FlagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

interface SupportTicket {
  ticket_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'transaction' | 'refund' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'pending_user' | 'resolved' | 'closed';
  assigned_to: string | null;
  assigned_agent_name: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  first_response_at: string | null;
  satisfaction_rating: number | null;
  tags: string[];
  attachments: string[];
  related_transaction_id: string | null;
  escalated: boolean;
  escalation_reason: string | null;
  sla_due_date: string;
  response_time_minutes: number | null;
  resolution_time_hours: number | null;
}

interface TicketMessage {
  message_id: string;
  ticket_id: string;
  sender_type: 'user' | 'agent' | 'system';
  sender_name: string;
  sender_email: string;
  message: string;
  created_at: string;
  attachments: string[];
  is_internal: boolean;
  message_type: 'text' | 'note' | 'status_change' | 'assignment';
}

interface TicketFilters {
  status: string;
  priority: string;
  category: string;
  assigned_to: string;
  date_from: string;
  date_to: string;
  escalated: string;
  satisfaction_rating: string;
}

interface PaginationInfo {
  count: number;
  next: string | null;
  previous: string | null;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  // New ticket modal state
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    user_email: '',
    user_name: '',
    user_phone: '',
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    related_transaction_id: '',
    tags: '',
  });
  const [newTicketErrors, setNewTicketErrors] = useState<Record<string, string>>({});
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  // Message reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);
  
  // Assignment and status change state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignToAgent, setAssignToAgent] = useState('');
  const [assigningTicket, setAssigningTicket] = useState(false);
  const [agents] = useState([
    { id: 'agent_1', name: 'Sarah Johnson', email: 'sarah@moroccoin.com' },
    { id: 'agent_2', name: 'Ahmed Benali', email: 'ahmed@moroccoin.com' },
    { id: 'agent_3', name: 'Maria Garcia', email: 'maria@moroccoin.com' },
    { id: 'agent_4', name: 'David Smith', email: 'david@moroccoin.com' },
  ]);
  
  const [filters, setFilters] = useState<TicketFilters>({
    status: '',
    priority: '',
    category: '',
    assigned_to: '',
    date_from: '',
    date_to: '',
    escalated: '',
    satisfaction_rating: '',
  });
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchTickets();
  }, [currentPage, filters, sortBy, sortOrder]);

  const debouncedSearch = debounce((term: string) => {
    fetchTickets(term);
  }, 500);

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      fetchTickets();
    }
  }, [searchTerm]);

  const fetchTickets = async (search?: string) => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockTickets: SupportTicket[] = [
        {
          ticket_id: 'TKT-001234',
          user_id: 'user_123',
          user_name: 'Ahmed El Mansouri',
          user_email: 'ahmed@email.com',
          user_phone: '+212 6 12 34 56 78',
          subject: 'Unable to complete money transfer',
          description: 'I am trying to send money to France but the transaction keeps failing at the verification step. I have tried multiple times with different payment methods.',
          category: 'transaction',
          priority: 'high',
          status: 'open',
          assigned_to: null,
          assigned_agent_name: null,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          resolved_at: null,
          first_response_at: null,
          satisfaction_rating: null,
          tags: ['transaction_failure', 'verification', 'france'],
          attachments: ['error_screenshot.png'],
          related_transaction_id: 'TXN-001234',
          escalated: false,
          escalation_reason: null,
          sla_due_date: '2024-01-16T10:30:00Z',
          response_time_minutes: null,
          resolution_time_hours: null,
        },
        {
          ticket_id: 'TKT-001235',
          user_id: 'user_456',
          user_name: 'Fatima Zahra',
          user_email: 'fatima@email.com',
          user_phone: '+212 6 98 76 54 32',
          subject: 'Request for transaction refund',
          description: 'I was charged twice for the same transaction. Please help me get a refund for the duplicate charge.',
          category: 'refund',
          priority: 'medium',
          status: 'in_progress',
          assigned_to: 'agent_1',
          assigned_agent_name: 'Sarah Johnson',
          created_at: '2024-01-14T09:15:00Z',
          updated_at: '2024-01-15T11:20:00Z',
          resolved_at: null,
          first_response_at: '2024-01-14T10:30:00Z',
          satisfaction_rating: null,
          tags: ['refund', 'duplicate_charge'],
          attachments: ['bank_statement.pdf'],
          related_transaction_id: 'TXN-001235',
          escalated: false,
          escalation_reason: null,
          sla_due_date: '2024-01-17T09:15:00Z',
          response_time_minutes: 75,
          resolution_time_hours: null,
        },
        {
          ticket_id: 'TKT-001236',
          user_id: 'user_789',
          user_name: 'Mohammed Benjelloun',
          user_email: 'mohammed@email.com',
          user_phone: '+212 6 11 22 33 44',
          subject: 'Account verification issues',
          description: 'My account verification has been pending for over a week. I uploaded all required documents but still no response.',
          category: 'account',
          priority: 'urgent',
          status: 'open',
          assigned_to: 'agent_2',
          assigned_agent_name: 'Ahmed Benali',
          created_at: '2024-01-08T16:45:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          resolved_at: null,
          first_response_at: '2024-01-09T08:00:00Z',
          satisfaction_rating: null,
          tags: ['verification', 'documents', 'escalated'],
          attachments: ['id_card.jpg', 'proof_address.pdf'],
          related_transaction_id: null,
          escalated: true,
          escalation_reason: 'Customer waited too long for verification',
          sla_due_date: '2024-01-12T16:45:00Z',
          response_time_minutes: 975,
          resolution_time_hours: null,
        },
        {
          ticket_id: 'TKT-001237',
          user_id: 'user_321',
          user_name: 'Aicha Benali',
          user_email: 'aicha@email.com',
          user_phone: '+212 6 55 44 33 22',
          subject: 'App crashes when sending money',
          description: 'The mobile app keeps crashing whenever I try to initiate a money transfer. This happens on both iOS and Android devices.',
          category: 'technical',
          priority: 'high',
          status: 'resolved',
          assigned_to: 'agent_3',
          assigned_agent_name: 'Maria Garcia',
          created_at: '2024-01-12T14:20:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          resolved_at: '2024-01-14T16:45:00Z',
          first_response_at: '2024-01-12T15:30:00Z',
          satisfaction_rating: 5,
          tags: ['mobile_app', 'crash', 'technical'],
          attachments: ['crash_log.txt'],
          related_transaction_id: null,
          escalated: false,
          escalation_reason: null,
          sla_due_date: '2024-01-15T14:20:00Z',
          response_time_minutes: 70,
          resolution_time_hours: 50.4,
        },
        {
          ticket_id: 'TKT-001238',
          user_id: 'user_654',
          user_name: 'Youssef Alami',
          user_email: 'youssef@email.com',
          user_phone: '+212 6 77 88 99 00',
          subject: 'Question about exchange rates',
          description: 'I would like to understand how your exchange rates are calculated and how often they are updated.',
          category: 'general',
          priority: 'low',
          status: 'closed',
          assigned_to: 'agent_4',
          assigned_agent_name: 'David Smith',
          created_at: '2024-01-10T11:10:00Z',
          updated_at: '2024-01-12T09:30:00Z',
          resolved_at: '2024-01-11T15:20:00Z',
          first_response_at: '2024-01-10T13:45:00Z',
          satisfaction_rating: 4,
          tags: ['exchange_rates', 'inquiry'],
          attachments: [],
          related_transaction_id: null,
          escalated: false,
          escalation_reason: null,
          sla_due_date: '2024-01-15T11:10:00Z',
          response_time_minutes: 155,
          resolution_time_hours: 28.2,
        }
      ];

      // Filter tickets based on search and filters
      let filteredTickets = mockTickets;
      
      if (search) {
        filteredTickets = filteredTickets.filter(t =>
          t.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
          t.user_name.toLowerCase().includes(search.toLowerCase()) ||
          t.user_email.toLowerCase().includes(search.toLowerCase()) ||
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply filters
      if (filters.status) {
        filteredTickets = filteredTickets.filter(t => t.status === filters.status);
      }
      if (filters.priority) {
        filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
      }
      if (filters.category) {
        filteredTickets = filteredTickets.filter(t => t.category === filters.category);
      }
      if (filters.assigned_to) {
        filteredTickets = filteredTickets.filter(t => t.assigned_to === filters.assigned_to);
      }
      if (filters.escalated) {
        filteredTickets = filteredTickets.filter(t => 
          filters.escalated === 'true' ? t.escalated : !t.escalated
        );
      }

      setTickets(filteredTickets);
      setPagination({
        count: filteredTickets.length,
        next: filteredTickets.length > 10 ? 'next' : null,
        previous: currentPage > 1 ? 'prev' : null,
      });
    } catch (err: any) {
      setError('Failed to fetch support tickets');
      console.error('Support tickets fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    try {
      setLoadingMessages(true);
      
      // Mock messages data
      const mockMessages: TicketMessage[] = [
        {
          message_id: 'msg_001',
          ticket_id: ticketId,
          sender_type: 'user',
          sender_name: 'Ahmed El Mansouri',
          sender_email: 'ahmed@email.com',
          message: 'I am trying to send money to France but the transaction keeps failing at the verification step. I have tried multiple times with different payment methods.',
          created_at: '2024-01-15T10:30:00Z',
          attachments: ['error_screenshot.png'],
          is_internal: false,
          message_type: 'text',
        },
        {
          message_id: 'msg_002',
          ticket_id: ticketId,
          sender_type: 'system',
          sender_name: 'System',
          sender_email: 'system@moroccoin.com',
          message: 'Ticket created and assigned to queue',
          created_at: '2024-01-15T10:31:00Z',
          attachments: [],
          is_internal: false,
          message_type: 'status_change',
        },
        {
          message_id: 'msg_003',
          ticket_id: ticketId,
          sender_type: 'agent',
          sender_name: 'Sarah Johnson',
          sender_email: 'sarah@moroccoin.com',
          message: 'Hello Ahmed, thank you for contacting us. I can see the transaction you\'re referring to. Let me investigate this issue for you.',
          created_at: '2024-01-15T11:45:00Z',
          attachments: [],
          is_internal: false,
          message_type: 'text',
        },
        {
          message_id: 'msg_004',
          ticket_id: ticketId,
          sender_type: 'agent',
          sender_name: 'Sarah Johnson',
          sender_email: 'sarah@moroccoin.com',
          message: 'Internal note: Checked transaction logs. Verification service was down between 10:00-10:45. Customer was affected.',
          created_at: '2024-01-15T12:00:00Z',
          attachments: [],
          is_internal: true,
          message_type: 'note',
        }
      ];
      
      setTicketMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      assigned_to: '',
      date_from: '',
      date_to: '',
      escalated: '',
      satisfaction_rating: '',
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

  const exportTickets = () => {
    const csvContent = [
      ['Ticket ID', 'Customer', 'Subject', 'Category', 'Priority', 'Status', 'Assigned To', 'Created Date'].join(','),
      ...tickets.map(t => [
        t.ticket_id,
        t.user_name,
        t.subject,
        t.category,
        t.priority,
        t.status,
        t.assigned_agent_name || 'Unassigned',
        formatDate(t.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'support_tickets.csv';
    a.click();
  };

  const validateNewTicketForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newTicketForm.user_email.trim()) {
      errors.user_email = 'Customer email is required';
    } else if (!/\S+@\S+\.\S+/.test(newTicketForm.user_email)) {
      errors.user_email = 'Please enter a valid email address';
    }
    if (!newTicketForm.user_name.trim()) {
      errors.user_name = 'Customer name is required';
    }
    if (!newTicketForm.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!newTicketForm.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setNewTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createNewTicket = async () => {
    if (!validateNewTicketForm()) return;
    
    setCreatingTicket(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTicket: SupportTicket = {
        ticket_id: `TKT-${Date.now().toString().slice(-6)}`,
        user_id: `user_${Date.now()}`,
        user_name: newTicketForm.user_name,
        user_email: newTicketForm.user_email,
        user_phone: newTicketForm.user_phone,
        subject: newTicketForm.subject,
        description: newTicketForm.description,
        category: newTicketForm.category as any,
        priority: newTicketForm.priority as any,
        status: 'open',
        assigned_to: null,
        assigned_agent_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: null,
        first_response_at: null,
        satisfaction_rating: null,
        tags: newTicketForm.tags ? newTicketForm.tags.split(',').map(t => t.trim()) : [],
        attachments: [],
        related_transaction_id: newTicketForm.related_transaction_id || null,
        escalated: false,
        escalation_reason: null,
        sla_due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        response_time_minutes: null,
        resolution_time_hours: null,
      };
      
      setTickets(prev => [newTicket, ...prev]);
      setShowNewTicketModal(false);
      setNewTicketForm({
        user_email: '',
        user_name: '',
        user_phone: '',
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        related_transaction_id: '',
        tags: '',
      });
      setNewTicketErrors({});
      
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setCreatingTicket(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    
    setSendingReply(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: TicketMessage = {
        message_id: `msg_${Date.now()}`,
        ticket_id: selectedTicket.ticket_id,
        sender_type: 'agent',
        sender_name: 'Current Agent',
        sender_email: 'agent@moroccoin.com',
        message: replyMessage,
        created_at: new Date().toISOString(),
        attachments: [],
        is_internal: isInternalNote,
        message_type: isInternalNote ? 'note' : 'text',
      };
      
      setTicketMessages(prev => [...prev, newMessage]);
      setReplyMessage('');
      setIsInternalNote(false);
      
      // Update ticket's first response time if this is the first agent response
      if (!selectedTicket.first_response_at && !isInternalNote) {
        const updatedTicket = {
          ...selectedTicket,
          first_response_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setSelectedTicket(updatedTicket);
        setTickets(prev => prev.map(t => t.ticket_id === selectedTicket.ticket_id ? updatedTicket : t));
      }
      
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const assignTicket = async () => {
    if (!assignToAgent || !selectedTicket) return;
    
    setAssigningTicket(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const agent = agents.find(a => a.id === assignToAgent);
      const updatedTicket = {
        ...selectedTicket,
        assigned_to: assignToAgent,
        assigned_agent_name: agent?.name || null,
        status: 'in_progress' as any,
        updated_at: new Date().toISOString(),
      };
      
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.ticket_id === selectedTicket.ticket_id ? updatedTicket : t));
      setShowAssignModal(false);
      setAssignToAgent('');
      
    } catch (error) {
      console.error('Error assigning ticket:', error);
    } finally {
      setAssigningTicket(false);
    }
  };

  const changeTicketStatus = async (newStatus: SupportTicket['status']) => {
    if (!selectedTicket) return;
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTicket = {
        ...selectedTicket,
        status: newStatus,
        updated_at: new Date().toISOString(),
        resolved_at: (newStatus === 'resolved' || newStatus === 'closed') ? new Date().toISOString() : null,
      };
      
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.ticket_id === selectedTicket.ticket_id ? updatedTicket : t));
      
    } catch (error) {
      console.error('Error changing ticket status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />;
      case 'in_progress':
        return <ArrowPathIcon className="h-4 w-4 text-blue-600" />;
      case 'pending_user':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'closed':
        return <XCircleIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'destructive' | 'outline' | 'info' => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'open':
      case 'pending_user':
        return 'warning';
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'billing':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'account':
        return <UserIcon className="h-4 w-4" />;
      case 'transaction':
        return <ArrowPathIcon className="h-4 w-4" />;
      case 'refund':
        return <ArrowPathIcon className="h-4 w-4" />;
      default:
        return <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />;
    }
  };

  const formatSLAStatus = (slaDate: string, status: string) => {
    const now = new Date();
    const sla = new Date(slaDate);
    const isOverdue = now > sla && status !== 'resolved' && status !== 'closed';
    const hoursUntilSLA = Math.ceil((sla.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (isOverdue) {
      return <Badge variant="destructive" size="sm">Overdue</Badge>;
    } else if (hoursUntilSLA <= 2 && status !== 'resolved' && status !== 'closed') {
      return <Badge variant="warning" size="sm">Due Soon</Badge>;
    } else if (status === 'resolved' || status === 'closed') {
      return <Badge variant="success" size="sm">Met SLA</Badge>;
    }
    return <Badge variant="outline" size="sm">{hoursUntilSLA}h left</Badge>;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
            <p className="text-gray-600">
              Manage customer support tickets and inquiries
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <Button variant="outline" size="sm" onClick={exportTickets}>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card variant="default" className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'open').length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'in_progress').length}
                  </p>
                </div>
                <ArrowPathIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Escalated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.escalated).length}
                  </p>
                </div>
                <FlagIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tickets.filter(t => t.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card variant="default" className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-lg font-bold text-gray-900">2.5h</p>
                </div>
                <ClockIcon className="h-8 w-8 text-purple-600" />
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
                      placeholder="Search by ticket ID, customer name, or subject..."
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
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending_user">Pending User</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="account">Account</option>
                        <option value="transaction">Transaction</option>
                        <option value="refund">Refund</option>
                        <option value="general">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.assigned_to}
                        onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                      >
                        <option value="">All Agents</option>
                        <option value="">Unassigned</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>{agent.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card variant="default">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-900">Support Tickets</CardTitle>
                <CardDescription className="text-gray-600">
                  {pagination.count} tickets found
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading tickets...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
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
                        onClick={() => handleSort('ticket_id')}
                      >
                        Ticket ID
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('user_name')}
                      >
                        Customer
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('subject')}
                      >
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('created_at')}
                      >
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SLA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => (
                      <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {ticket.ticket_id}
                            </div>
                            {ticket.escalated && (
                              <FlagIcon className="h-4 w-4 text-red-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ticket.user_name}</div>
                            <div className="text-sm text-gray-500">{ticket.user_email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={ticket.subject}>
                            {ticket.subject}
                          </div>
                          {ticket.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {ticket.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                              {ticket.tags.length > 2 && (
                                <Badge variant="outline" size="sm">
                                  +{ticket.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getCategoryIcon(ticket.category)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {ticket.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getPriorityVariant(ticket.priority)} className="capitalize">
                            {ticket.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(ticket.status)} className="flex items-center space-x-1 w-fit">
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {ticket.assigned_agent_name || (
                              <span className="text-gray-500">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{formatDate(ticket.created_at)}</div>
                            <div className="text-xs text-gray-500">{formatDateTime(ticket.created_at).split(' ')[1]}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatSLAStatus(ticket.sla_due_date, ticket.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              fetchTicketMessages(ticket.ticket_id);
                              setShowTicketDetails(true);
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

        {/* New Ticket Modal */}
        {showNewTicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Create New Ticket</h3>
                  <button
                    onClick={() => {
                      setShowNewTicketModal(false);
                      setNewTicketForm({
                        user_email: '',
                        user_name: '',
                        user_phone: '',
                        subject: '',
                        description: '',
                        category: 'general',
                        priority: 'medium',
                        related_transaction_id: '',
                        tags: '',
                      });
                      setNewTicketErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
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
                          newTicketErrors.user_name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="John Doe"
                        value={newTicketForm.user_name}
                        onChange={(e) => setNewTicketForm(prev => ({ ...prev, user_name: e.target.value }))}
                      />
                      {newTicketErrors.user_name && (
                        <p className="mt-1 text-sm text-red-600">{newTicketErrors.user_name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          newTicketErrors.user_email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="john@example.com"
                        value={newTicketForm.user_email}
                        onChange={(e) => setNewTicketForm(prev => ({ ...prev, user_email: e.target.value }))}
                      />
                      {newTicketErrors.user_email && (
                        <p className="mt-1 text-sm text-red-600">{newTicketErrors.user_email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+212 6 12 34 56 78"
                      value={newTicketForm.user_phone}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, user_phone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Ticket Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        newTicketErrors.subject ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      placeholder="Brief description of the issue"
                      value={newTicketForm.subject}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                    {newTicketErrors.subject && (
                      <p className="mt-1 text-sm text-red-600">{newTicketErrors.subject}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        newTicketErrors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                      }`}
                      rows={4}
                      placeholder="Detailed description of the issue..."
                      value={newTicketForm.description}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                    {newTicketErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{newTicketErrors.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTicketForm.category}
                        onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="account">Account</option>
                        <option value="transaction">Transaction</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={newTicketForm.priority}
                        onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Related Transaction ID</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TXN-001234 (if applicable)"
                      value={newTicketForm.related_transaction_id}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, related_transaction_id: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="urgent, payment_issue, mobile_app (comma separated)"
                      value={newTicketForm.tags}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, tags: e.target.value }))}
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowNewTicketModal(false);
                      setNewTicketForm({
                        user_email: '',
                        user_name: '',
                        user_phone: '',
                        subject: '',
                        description: '',
                        category: 'general',
                        priority: 'medium',
                        related_transaction_id: '',
                        tags: '',
                      });
                      setNewTicketErrors({});
                    }}
                    disabled={creatingTicket}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={createNewTicket}
                    disabled={creatingTicket}
                    loading={creatingTicket}
                  >
                    {creatingTicket ? 'Creating Ticket...' : 'Create Ticket'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {showTicketDetails && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.ticket_id}</h3>
                    <Badge variant={getStatusVariant(selectedTicket.status)} className="flex items-center space-x-1">
                      {getStatusIcon(selectedTicket.status)}
                      <span className="capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant={getPriorityVariant(selectedTicket.priority)} className="capitalize">
                      {selectedTicket.priority}
                    </Badge>
                    {selectedTicket.escalated && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <FlagIcon className="h-3 w-3" />
                        <span>Escalated</span>
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setShowTicketDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Ticket Info & Messages */}
                <div className="flex-1 flex flex-col">
                  {/* Ticket Information */}
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          Customer Information
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-20">Name:</span>
                            <span className="text-sm text-gray-900">{selectedTicket.user_name}</span>
                          </div>
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{selectedTicket.user_email}</span>
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{selectedTicket.user_phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Details */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Ticket Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-20">Category:</span>
                            <div className="flex items-center">
                              {getCategoryIcon(selectedTicket.category)}
                              <span className="ml-1 text-sm text-gray-900 capitalize">{selectedTicket.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-20">Created:</span>
                            <span className="text-sm text-gray-900">{formatDateTime(selectedTicket.created_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-500 w-20">SLA:</span>
                            {formatSLAStatus(selectedTicket.sla_due_date, selectedTicket.status)}
                          </div>
                          {selectedTicket.related_transaction_id && (
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-500 w-20">Transaction:</span>
                              <span className="text-sm text-blue-600 cursor-pointer hover:underline">
                                {selectedTicket.related_transaction_id}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subject and Description */}
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h4>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-3 border">
                        {selectedTicket.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {selectedTicket.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center space-x-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-wrap gap-1">
                            {selectedTicket.tags.map(tag => (
                              <Badge key={tag} variant="outline" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Conversation</h4>
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ticketMessages.map((message) => (
                          <div key={message.message_id} className={`flex ${message.sender_type === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-3xl ${
                              message.sender_type === 'user' 
                                ? 'bg-gray-100' 
                                : message.is_internal 
                                  ? 'bg-yellow-50 border border-yellow-200' 
                                  : 'bg-blue-500 text-white'
                            } rounded-lg p-4`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className={`text-sm font-medium ${
                                    message.sender_type === 'user' ? 'text-gray-900' : 
                                    message.is_internal ? 'text-yellow-800' : 'text-white'
                                  }`}>
                                    {message.sender_name}
                                  </span>
                                  {message.sender_type === 'agent' && (
                                    <Badge variant="outline" size="sm" className={message.is_internal ? 'bg-yellow-100 text-yellow-800' : 'bg-white text-blue-600'}>
                                      {message.is_internal ? 'Internal Note' : 'Agent'}
                                    </Badge>
                                  )}
                                  {message.sender_type === 'system' && (
                                    <Badge variant="outline" size="sm" className="bg-gray-100 text-gray-600">
                                      System
                                    </Badge>
                                  )}
                                </div>
                                <span className={`text-xs ${
                                  message.sender_type === 'user' ? 'text-gray-500' : 
                                  message.is_internal ? 'text-yellow-600' : 'text-blue-100'
                                }`}>
                                  {formatDateTime(message.created_at)}
                                </span>
                              </div>
                              <p className={`text-sm ${
                                message.sender_type === 'user' ? 'text-gray-700' : 
                                message.is_internal ? 'text-yellow-800' : 'text-white'
                              }`}>
                                {message.message}
                              </p>
                              {message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment, idx) => (
                                    <div key={idx} className="flex items-center space-x-2">
                                      <PaperClipIcon className="h-4 w-4" />
                                      <span className="text-sm underline cursor-pointer">{attachment}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reply Section */}
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isInternalNote}
                            onChange={(e) => setIsInternalNote(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Internal note (not visible to customer)</span>
                        </label>
                      </div>
                      
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <textarea
                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder={isInternalNote ? "Add an internal note..." : "Type your reply..."}
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={sendReply}
                            disabled={!replyMessage.trim() || sendingReply}
                            loading={sendingReply}
                          >
                            {sendingReply ? 'Sending...' : (isInternalNote ? 'Add Note' : 'Send Reply')}
                          </Button>
                          <Button variant="outline" size="sm">
                            <PaperClipIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel - Actions & Info */}
                <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        {selectedTicket.status === 'open' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => changeTicketStatus('in_progress')}
                          >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Start Working
                          </Button>
                        )}
                        
                        {(selectedTicket.status === 'open' || selectedTicket.status === 'in_progress') && (
                          <Button
                            variant="warning"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => changeTicketStatus('pending_user')}
                          >
                            <ClockIcon className="h-4 w-4 mr-2" />
                            Pending User
                          </Button>
                        )}
                        
                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                          <Button
                            variant="success"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => changeTicketStatus('resolved')}
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </Button>
                        )}
                        
                        {selectedTicket.status === 'resolved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => changeTicketStatus('closed')}
                          >
                            <XCircleIcon className="h-4 w-4 mr-2" />
                            Close Ticket
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Assignment */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Assignment</h4>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Assigned to: </span>
                          <span className="text-gray-900">
                            {selectedTicket.assigned_agent_name || 'Unassigned'}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => setShowAssignModal(true)}
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          {selectedTicket.assigned_to ? 'Reassign' : 'Assign Ticket'}
                        </Button>
                      </div>
                    </div>

                    {/* Contact Customer */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Contact Customer</h4>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open(`mailto:${selectedTicket.user_email}`)}
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => window.open(`tel:${selectedTicket.user_phone}`)}
                        >
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          Call Customer
                        </Button>
                      </div>
                    </div>

                    {/* Escalation */}
                    {!selectedTicket.escalated && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Escalation</h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => {
                            // Mock escalation
                            const updatedTicket = { ...selectedTicket, escalated: true, escalation_reason: 'Escalated by admin' };
                            setSelectedTicket(updatedTicket);
                            setTickets(prev => prev.map(t => t.ticket_id === selectedTicket.ticket_id ? updatedTicket : t));
                          }}
                        >
                          <FlagIcon className="h-4 w-4 mr-2" />
                          Escalate Ticket
                        </Button>
                      </div>
                    )}

                    {/* Ticket Metrics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Metrics</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">First Response:</span>
                          <span className="text-gray-900">
                            {selectedTicket.first_response_at ? 
                              `${selectedTicket.response_time_minutes}m` : 
                              'Pending'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Resolution Time:</span>
                          <span className="text-gray-900">
                            {selectedTicket.resolution_time_hours ? 
                              `${selectedTicket.resolution_time_hours.toFixed(1)}h` : 
                              'Pending'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Satisfaction:</span>
                          <span className="text-gray-900">
                            {selectedTicket.satisfaction_rating ? (
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                {selectedTicket.satisfaction_rating}/5
                              </div>
                            ) : 'Not rated'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedTicket.attachments.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Attachments</h4>
                        <div className="space-y-2">
                          {selectedTicket.attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                              <div className="flex items-center space-x-2">
                                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{attachment}</span>
                              </div>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Assign Ticket</h3>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setAssignToAgent('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{selectedTicket.ticket_id}</h4>
                  <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
                  <p className="text-sm text-gray-500">Currently: {selectedTicket.assigned_agent_name || 'Unassigned'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Agent
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={assignToAgent}
                    onChange={(e) => setAssignToAgent(e.target.value)}
                  >
                    <option value="">Select an agent...</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAssignModal(false);
                      setAssignToAgent('');
                    }}
                    disabled={assigningTicket}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    onClick={assignTicket}
                    disabled={!assignToAgent || assigningTicket}
                    loading={assigningTicket}
                  >
                    {assigningTicket ? 'Assigning...' : 'Assign Ticket'}
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