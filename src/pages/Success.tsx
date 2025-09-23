import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Smartphone, Calendar, MapPin, ArrowRight } from 'lucide-react';
import type { Ticket } from '../types';
import { useStore } from '../store/useStore';

export const Success: React.FC = () => {
  const location = useLocation();
  const { currentEvent, seats } = useStore();
  const ticket = location.state?.ticket as Ticket;

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-f1-gray text-lg">No ticket found</p>
          <Link to="/events" className="text-f1-red hover:underline mt-2 inline-block">
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const seat = seats.find(s => s.id === ticket.seatId);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-f1-gray max-w-2xl mx-auto">
            Your F1 ticket has been confirmed. Get ready for an incredible racing experience!
          </p>
        </div>

        {/* Ticket Card */}
        <div className="bg-gradient-to-r from-f1-red to-red-600 rounded-2xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 chequered-pattern opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h2 className="text-3xl font-display font-bold text-white mb-2">
                  F1 GRAND PRIX TICKET
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-red-100">
                    <Calendar size={18} />
                    <span className="font-medium">{currentEvent?.date}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-red-100">
                    <MapPin size={18} />
                    <span className="font-medium">{currentEvent?.venue}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded mx-auto mb-3 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black rounded grid grid-cols-4 gap-0.5">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'} rounded-sm`}></div>
                    ))}
                  </div>
                </div>
                <p className="text-xs font-mono text-gray-600">{ticket.qrCode}</p>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="border-t border-red-400 mt-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-red-200 text-sm font-medium">SECTION</div>
                  <div className="text-white text-xl font-bold">{seat?.section}</div>
                </div>
                <div>
                  <div className="text-red-200 text-sm font-medium">ROW</div>
                  <div className="text-white text-xl font-bold">{seat?.row}</div>
                </div>
                <div>
                  <div className="text-red-200 text-sm font-medium">SEAT</div>
                  <div className="text-white text-xl font-bold">{seat?.number}</div>
                </div>
              </div>
            </div>

            {/* Ticket ID */}
            <div className="text-center mt-6 pt-4 border-t border-red-400">
              <div className="text-red-200 text-sm font-medium">TICKET ID</div>
              <div className="font-mono text-white text-sm">{ticket.id}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <button className="bg-f1-dark hover:bg-f1-gray/20 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 border border-white/10">
            <Smartphone size={20} />
            <span>Add to Wallet</span>
          </button>
          <button className="bg-f1-dark hover:bg-f1-gray/20 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 border border-white/10">
            <Download size={20} />
            <span>Download PDF</span>
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-f1-dark rounded-lg p-8">
          <h3 className="text-2xl font-display font-bold text-white mb-6 f1-accent">
            What's Next?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-f1-red/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-f1-red" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-2">Save Your Ticket</h4>
              <p className="text-f1-gray text-sm">
                Add to your mobile wallet or save the PDF for easy access at the venue.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-f1-red/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-f1-red" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-2">Plan Your Visit</h4>
              <p className="text-f1-gray text-sm">
                Check venue guidelines, parking options, and arrival recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-f1-red/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-f1-red" size={24} />
              </div>
              <h4 className="font-semibold text-white mb-2">Race Day</h4>
              <p className="text-f1-gray text-sm">
                Present your QR code at entry and enjoy the ultimate F1 experience.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            to="/my-orders"
            className="bg-f1-red hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>View My Orders</span>
          </Link>
          <Link
            to="/events"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-f1-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>Browse More Events</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};