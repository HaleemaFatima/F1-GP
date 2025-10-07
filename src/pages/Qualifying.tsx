import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Filter, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { mockApi } from '../utils/mockApi';
import { SeatMap } from '../components/SeatMap';
import { SeatLegend } from '../components/SeatLegend';
import { CountdownTimer } from '../components/CountdownTimer';
import { Modal } from '../components/Modal';

export const Qualifying: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentEvent,
    seats,
    inventory,
    selectedSeats,
    currentHold,
    filters,
    userId,
    isLoading,
    setCurrentEvent,
    setSeatMap,
    setSelectedSeats,
    setCurrentHold,
    setFilters,
    setLoading,
    addToast,
    updateSeatStatus,
    clearCurrentBooking
  } = useStore();

  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictSeatId, setConflictSeatId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load qualifying event and seat map
  useEffect(() => {
    const loadEventData = async () => {
      const eventId = 'qualifying-2025';
      
      setLoading(true);
      try {
        const [event, seatMapData] = await Promise.all([
          mockApi.getEvent(eventId),
          mockApi.getSeatMap(eventId)
        ]);

        if (event) {
          setCurrentEvent(event);
          setSeatMap(seatMapData.seats, seatMapData.inventory);
        } else {
          navigate('/events');
        }
      } catch (error) {
        console.error('Failed to load event data:', error);
        addToast({ type: 'error', message: 'Failed to load event data' });
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [navigate, setCurrentEvent, setSeatMap, setLoading, addToast]);

  // Handle seat selection
  const handleSeatSelect = useCallback(async (seatId: string) => {
    if (!currentEvent || !eventId) return;

    // If seat is already selected, deselect it
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      return;
    }

    // Check if seat exists and get its current status
    const seatInventory = inventory.find(inv => inv.seatId === seatId);
    if (!seatInventory) {
      console.warn('Seat not found in inventory:', seatId);
      return;
    }

    // If seat is already sold or held by someone else, show conflict modal immediately
    if (seatInventory.status === 'SOLD' || 
        (seatInventory.status === 'HELD' && seatInventory.holdUserId !== userId)) {
      setConflictSeatId(seatId);
      setShowConflictModal(true);
      return;
    }

    // If there's already a hold, release it first
    if (currentHold) {
      await mockApi.releaseHold(currentHold.id);
      setCurrentHold(null);
    }

    try {
      const result = await mockApi.createHold(currentEvent.id, seatId, userId);
      
      if ('error' in result) {
        if (result.error === 'seat_unavailable') {
          setConflictSeatId(seatId);
          setShowConflictModal(true);
          // Refresh seat map to get latest status
          const seatMapData = await mockApi.getSeatMap(currentEvent.id);
          setSeatMap(seatMapData.seats, seatMapData.inventory);
        }
        return;
      }

      // Successfully created hold
      const hold = {
        id: result.holdId,
        eventId: currentEvent.id,
        seatIds: [seatId],
        userId,
        expireAt: result.expireAt,
        status: 'ACTIVE' as const
      };

      setCurrentHold(hold);
      setSelectedSeats([seatId]);
      addToast({ type: 'success', message: 'Seat held for you!' });

    } catch (error) {
      console.error('Failed to hold seat:', error);
      addToast({ type: 'error', message: 'Failed to hold seat. Please try again.' });
    }
  }, [currentEvent, selectedSeats, currentHold, userId, inventory, setSelectedSeats, setCurrentHold, addToast, setSeatMap]);

  // Handle hold expiry
  const handleHoldExpiry = useCallback(() => {
    if (currentHold) {
      setCurrentHold(null);
      setSelectedSeats([]);
      updateSeatStatus(currentHold.seatIds[0], 'AVAILABLE');
      addToast({ type: 'warning', message: 'Hold expired. Please select your seat again.' });
    }
  }, [currentHold, setCurrentHold, setSelectedSeats, updateSeatStatus, addToast]);

  // Handle refresh
  const handleRefresh = async () => {
    const eventId = 'qualifying-2025';
    
    setIsRefreshing(true);
    try {
      const seatMapData = await mockApi.getSeatMap(eventId);
      setSeatMap(seatMapData.seats, seatMapData.inventory);
      addToast({ type: 'success', message: 'Seat map refreshed' });
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to refresh seat map' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    if (currentHold) {
      navigate('/checkout');
    }
  };

  // Filter handlers
  const handleSectionFilter = (section: string) => {
    setFilters({ ...filters, section: filters.section === section ? undefined : section });
  };

  const handlePriceFilter = (maxPrice: number) => {
    setFilters({ ...filters, maxPrice: filters.maxPrice === maxPrice ? undefined : maxPrice });
  };

  const handleAccessibilityToggle = () => {
    setFilters({ ...filters, showAccessible: !filters.showAccessible });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-f1-dark rounded-lg mx-auto mb-4"></div>
          <p className="text-f1-gray">Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-f1-gray text-lg">Event not found</p>
        </div>
      </div>
    );
  }

  const selectedSeat = selectedSeats[0] ? seats.find(s => s.id === selectedSeats[0]) : null;
  const sections = [...new Set(seats.map(s => s.section))].sort();
  const priceRanges = [79, 99, 149, 199, 299];

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
            {currentEvent.name}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-f1-gray">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-f1-red" />
              <span>{currentEvent.date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={18} className="text-f1-red" />
              <span>{currentEvent.venue}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Legend and Filters */}
          <div className="lg:col-span-1 space-y-6">
            <SeatLegend />

            {/* Filters */}
            <div className="bg-f1-dark rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <Filter size={18} className="text-f1-red" />
                <h3 className="font-display font-semibold text-white">Filters</h3>
              </div>

              {/* Section Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-f1-gray mb-2">Section</h4>
                <div className="flex flex-wrap gap-2">
                  {sections.map(section => (
                    <button
                      key={section}
                      onClick={() => handleSectionFilter(section)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        filters.section === section
                          ? 'bg-f1-red text-white'
                          : 'bg-f1-black text-f1-gray hover:text-white'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-f1-gray mb-2">Max Price</h4>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map(price => (
                    <button
                      key={price}
                      onClick={() => handlePriceFilter(price)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        filters.maxPrice === price
                          ? 'bg-f1-red text-white'
                          : 'bg-f1-black text-f1-gray hover:text-white'
                      }`}
                    >
                      ${price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Toggle */}
              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.showAccessible || false}
                    onChange={handleAccessibilityToggle}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border ${filters.showAccessible ? 'bg-f1-red border-f1-red' : 'border-f1-gray'}`}>
                    {filters.showAccessible && (
                      <div className="w-2 h-2 bg-white rounded-sm m-0.5"></div>
                    )}
                  </div>
                  <span className="text-sm text-f1-gray">Wheelchair accessible only</span>
                </label>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full bg-f1-black hover:bg-f1-gray/20 text-f1-gray hover:text-white px-4 py-2 rounded transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span>Refresh Map</span>
              </button>
            </div>
          </div>

          {/* Main Content - Seat Map */}
          <div className="lg:col-span-2">
            <SeatMap
              seats={seats}
              inventory={inventory}
              onSeatSelect={handleSeatSelect}
            />
          </div>

          {/* Right Sidebar - Your Hold */}
          <div className="lg:col-span-1">
            <div className="bg-f1-dark rounded-lg p-4 sticky top-24">
              <h3 className="font-display font-semibold text-white mb-4">Your Hold</h3>

              {currentHold && selectedSeat ? (
                <div className="space-y-4">
                  {/* Seat Info */}
                  <div className="bg-f1-black rounded-lg p-4">
                    <div className="text-sm text-f1-gray mb-1">Seat</div>
                    <div className="text-lg font-semibold text-white">
                      {selectedSeat.section}{selectedSeat.row}-{selectedSeat.number}
                    </div>
                    <div className="text-f1-red font-bold text-xl mt-1">
                      ${selectedSeat.price}
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="text-center">
                    <CountdownTimer
                      expireAt={currentHold.expireAt}
                      onExpire={handleHoldExpiry}
                      className="justify-center"
                    />
                    <p className="text-xs text-f1-gray mt-2">
                      We'll keep your seat warm for 10 minutes.
                    </p>
                  </div>

                  {/* Confirm Button */}
                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-f1-red hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>Confirm & Pay</span>
                    <ArrowRight size={18} />
                  </button>

                  {/* Order Summary */}
                  <div className="border-t border-white/10 pt-4 text-sm">
                    <div className="flex justify-between text-f1-gray">
                      <span>Subtotal</span>
                      <span>${selectedSeat.price}</span>
                    </div>
                    <div className="flex justify-between text-f1-gray">
                      <span>Fees</span>
                      <span>$5</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white mt-2 pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span>${selectedSeat.price + 5}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-f1-gray">
                  <p className="mb-2">No seat selected</p>
                  <p className="text-sm">Click on an available seat to hold it.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Modal */}
      <Modal
        isOpen={showConflictModal}
        onClose={() => setShowConflictModal(false)}
        title="Seat Unavailable"
      >
        <div className="text-center py-4">
          <AlertTriangle className="text-warning mx-auto mb-4" size={48} />
          <p className="text-white mb-4">
            This seat was just taken by another customer. Please choose a different seat.
          </p>
          <button
            onClick={() => setShowConflictModal(false)}
            className="bg-f1-red hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Choose Another Seat
          </button>
        </div>
      </Modal>

      {/* Mobile Hold Drawer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30">
        {currentHold && selectedSeat && (
          <div className="bg-f1-dark border-t border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-white">
                  {selectedSeat.section}{selectedSeat.row}-{selectedSeat.number}
                </div>
                <div className="text-f1-red font-bold">${selectedSeat.price}</div>
              </div>
              <CountdownTimer
                expireAt={currentHold.expireAt}
                onExpire={handleHoldExpiry}
              />
            </div>
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-f1-red hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>Confirm & Pay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};