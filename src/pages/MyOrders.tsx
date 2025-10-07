import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Download, Ticket, Search, Filter } from 'lucide-react';
import { useStore } from '../store/useStore';
import { mockApi } from '../utils/mockApi';

export const MyOrders: React.FC = () => {
  const { userId, orders, tickets, setOrders, setTickets, isLoading, setLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const loadOrdersAndTickets = async () => {
      setLoading(true);
      try {
        const [ordersData, ticketsData] = await Promise.all([
          mockApi.getOrders(userId),
          mockApi.getTickets(userId)
        ]);
        setOrders(ordersData);
        setTickets(ticketsData);
      } catch (error) {
        console.error('Failed to load orders and tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrdersAndTickets();
  }, [userId, setOrders, setTickets, setLoading]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-f1-dark rounded-lg mx-auto mb-4"></div>
          <p className="text-f1-gray">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-4 f1-accent">
            My Orders
          </h1>
          <p className="text-xl text-f1-gray">
            View and manage your F1 ticket purchases
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-f1-dark rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-f1-gray" size={18} />
              <input
                type="text"
                placeholder="Search orders by ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-f1-black border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-f1-gray" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-f1-black border border-white/20 rounded-lg pl-10 pr-8 py-3 text-white focus:border-f1-red focus:outline-none transition-colors appearance-none"
              >
                <option value="all">All Orders</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderTickets = tickets.filter(t => t.orderId === order.id);
              return (
                <OrderCard key={order.id} order={order} tickets={orderTickets} />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Ticket className="text-f1-gray mx-auto mb-4" size={64} />
            <h3 className="text-xl font-semibold text-white mb-2">
              {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
            </h3>
            <p className="text-f1-gray mb-6">
              {orders.length === 0 
                ? 'Book your first F1 experience today!' 
                : 'Try adjusting your search criteria'
              }
            </p>
            {orders.length === 0 && (
              <Link
                to="/events"
                className="bg-f1-red hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors inline-block"
              >
                Browse Events
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: any;
  tickets: any[];
}

const OrderCard: React.FC<OrderCardProps> = ({ order, tickets }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-success text-white';
      case 'PENDING':
        return 'bg-warning text-white';
      case 'REFUNDED':
        return 'bg-f1-gray text-white';
      default:
        return 'bg-f1-gray text-white';
    }
  };

  return (
    <div className="bg-f1-dark rounded-lg border border-white/10 overflow-hidden">
      <div className="p-6">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Order #{order.id.slice(-8)}
            </h3>
            <p className="text-f1-gray">
              {new Date(order.createdAt).toLocaleDateString()} • {tickets.length} ticket(s)
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">${order.amount}</div>
            </div>
          </div>
        </div>

        {/* Event Info */}
        <div className="bg-f1-black rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-white mb-2">F1 Grand Prix — Sunday</h4>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-sm text-f1-gray">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-f1-red" />
              <span>Nov 23, 2025 • 3:00 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-f1-red" />
              <span>Circuit de Monaco</span>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-f1-black rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">Ticket #{ticket.id.slice(-6)}</div>
                  <div className="text-f1-gray text-sm">Section A, Row 1, Seat 1</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-mono text-xs text-f1-gray">{ticket.qrCode}</div>
                  </div>
                  <button className="text-f1-red hover:text-red-400 transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {order.status === 'PAID' && (
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button className="flex-1 bg-f1-red hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <Download size={18} />
              <span>Download All Tickets</span>
            </button>
            <button className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/10 font-semibold py-2 px-4 rounded-lg transition-colors">
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
};