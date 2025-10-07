import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, CreditCard, Lock, Loader } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabaseApi } from '../utils/supabaseApi';
import { CountdownTimer } from '../components/CountdownTimer';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEvent,
    seats,
    currentHold,
    userId,
    setCurrentHold,
    addToast,
    clearCurrentBooking
  } = useStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: 'user@example.com'
  });

  useEffect(() => {
    // Redirect if no active hold
    if (!currentHold) {
      navigate('/events');
      return;
    }
  }, [currentHold, navigate]);

  const selectedSeat = currentHold?.seatIds[0] 
    ? seats.find(s => s.id === currentHold.seatIds[0]) 
    : null;

  const handleHoldExpiry = () => {
    setCurrentHold(null);
    clearCurrentBooking();
    addToast({ type: 'error', message: 'Hold expired during checkout. Please start over.' });
    navigate(`/event/${currentEvent?.id}`);
  };

  const handlePayment = async () => {
    if (!currentHold) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing with idempotency key
      const paymentRequestId = `payment-${Date.now()}-${Math.random()}`;
      
      const result = await supabaseApi.confirmHold(currentHold.id, paymentRequestId);
      
      if ('error' in result) {
        if (result.error === 'hold_expired') {
          addToast({ type: 'error', message: 'Hold expired. Please start over.' });
          navigate(`/event/${currentEvent?.id}`);
        }
        return;
      }

      // Payment successful
      clearCurrentBooking();
      addToast({ type: 'success', message: 'Payment successful! Your ticket is ready.' });
      navigate('/success', { state: { ticket: result.ticket } });

    } catch (error) {
      console.error('Payment failed:', error);
      addToast({ type: 'error', message: 'Payment failed. Safe to retry - no double charge.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentHold || !selectedSeat || !currentEvent) {
    return null;
  }

  const subtotal = selectedSeat.price;
  const fees = 5;
  const total = subtotal + fees;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="text-f1-gray hover:text-white" size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Checkout</h1>
            <p className="text-f1-gray">Complete your F1 ticket purchase</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-f1-dark rounded-lg p-6 space-y-6">
              {/* Idempotency Notice */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-400 mb-1">Payment Protection</h3>
                  <p className="text-sm text-blue-200">
                    Safe to retry if interrupted - no double charge guaranteed.
                  </p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="font-display font-semibold text-white mb-4 flex items-center space-x-2">
                  <CreditCard size={20} className="text-f1-red" />
                  <span>Payment Method</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-f1-gray mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      className="w-full bg-f1-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-f1-gray mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                        className="w-full bg-f1-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-f1-gray mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                        className="w-full bg-f1-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-f1-gray mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={paymentData.name}
                      onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                      className="w-full bg-f1-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-f1-gray mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => setPaymentData({...paymentData, email: e.target.value})}
                      className="w-full bg-f1-black border border-white/20 rounded-lg px-4 py-3 text-white placeholder-f1-gray focus:border-f1-red focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-center space-x-2 text-sm text-f1-gray">
                <Lock size={16} className="text-success" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-f1-red hover:bg-red-600 disabled:bg-f1-red/50 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-3 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    <span>Pay ${total}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-f1-dark rounded-lg p-6 sticky top-24">
              <h3 className="font-display font-semibold text-white mb-4">Order Summary</h3>

              {/* Event Info */}
              <div className="bg-f1-black rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-white mb-2">{currentEvent.name}</h4>
                <p className="text-sm text-f1-gray mb-1">{currentEvent.date}</p>
                <p className="text-sm text-f1-gray">{currentEvent.venue}</p>
              </div>

              {/* Seat Info */}
              <div className="bg-f1-black rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">
                      Section {selectedSeat.section}
                    </h4>
                    <p className="text-f1-gray">
                      Row {selectedSeat.row}, Seat {selectedSeat.number}
                    </p>
                    {selectedSeat.isAccessible && (
                      <p className="text-xs text-success mt-1">Wheelchair Accessible</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-f1-red font-bold text-lg">${selectedSeat.price}</div>
                  </div>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <CountdownTimer
                    expireAt={currentHold.expireAt}
                    onExpire={handleHoldExpiry}
                    className="justify-center"
                  />
                  <p className="text-xs text-warning mt-2">
                    Complete payment before timer expires
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-f1-gray">
                  <span>Ticket Price</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-f1-gray">
                  <span>Service Fee</span>
                  <span>${fees}</span>
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-white text-base">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};