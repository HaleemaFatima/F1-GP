import React, { useCallback, useMemo, useState } from 'react';
import type { Seat, SeatInventory } from '../types';
import { useStore } from '../store/useStore';
import { Armchair as Wheelchair } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  inventory: SeatInventory[];
  onSeatSelect: (seatId: string) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  inventory,
  onSeatSelect
}) => {
  const { selectedSeats, currentHold, userId, filters } = useStore();
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);
  
  // Group seats by section for rendering
  const seatsBySection = useMemo(() => {
    const sections: Record<string, Seat[]> = {};
    
    seats.forEach(seat => {
      if (!sections[seat.section]) {
        sections[seat.section] = [];
      }
      sections[seat.section].push(seat);
    });
    
    // Sort seats within each section
    Object.keys(sections).forEach(section => {
      sections[section].sort((a, b) => {
        const rowCompare = parseInt(a.row) - parseInt(b.row);
        if (rowCompare !== 0) return rowCompare;
        return parseInt(a.number) - parseInt(b.number);
      });
    });
    
    return sections;
  }, [seats]);

  // Apply filters
  const filteredSections = useMemo(() => {
    if (!filters.section && !filters.maxPrice && !filters.showAccessible) {
      return seatsBySection;
    }

    const filtered: Record<string, Seat[]> = {};
    
    Object.entries(seatsBySection).forEach(([section, sectionSeats]) => {
      let filteredSeats = sectionSeats;
      
      if (filters.section && section !== filters.section) {
        return;
      }
      
      if (filters.maxPrice) {
        filteredSeats = filteredSeats.filter(seat => seat.price <= filters.maxPrice!);
      }
      
      if (filters.showAccessible) {
        filteredSeats = filteredSeats.filter(seat => seat.isAccessible);
      }
      
      if (filteredSeats.length > 0) {
        filtered[section] = filteredSeats;
      }
    });
    
    return filtered;
  }, [seatsBySection, filters]);

  const getSeatStatus = useCallback((seatId: string) => {
    if (selectedSeats.includes(seatId)) return 'SELECTED';
    
    const inventoryItem = inventory.find(inv => inv.seatId === seatId);
    if (!inventoryItem) return 'AVAILABLE';
    
    // Show seats held by current user as selected
    if (inventoryItem.status === 'HELD' && inventoryItem.holdUserId === userId) {
      return 'SELECTED';
    }
    
    return inventoryItem.status;
  }, [inventory, selectedSeats, userId]);

  const handleSeatClick = useCallback((seat: Seat) => {
    const status = getSeatStatus(seat.id);
    
    if (status === 'SOLD' || (status === 'HELD' && inventory.find(inv => inv.seatId === seat.id)?.holdUserId !== userId)) {
      return; // Can't select sold or held by others
    }
    
    onSeatSelect(seat.id);
  }, [getSeatStatus, inventory, userId, onSeatSelect]);

  const getSeatClassName = useCallback((seatId: string) => {
    const status = getSeatStatus(seatId);
    const baseClasses = 'w-8 h-8 rounded text-xs font-medium border transition-all duration-150 cursor-pointer hover:scale-105 focus-visible';
    
    switch (status) {
      case 'AVAILABLE':
        return `${baseClasses} seat-available hover:border-f1-red`;
      case 'SELECTED':
        return `${baseClasses} seat-selected`;
      case 'HELD':
        return `${baseClasses} seat-held cursor-not-allowed`;
      case 'SOLD':
        return `${baseClasses} seat-sold cursor-not-allowed`;
      default:
        return baseClasses;
    }
  }, [getSeatStatus]);

  return (
    <div className="bg-f1-dark rounded-lg p-6 overflow-auto">
      {/* Stage/Track indicator */}
      <div className="mb-8 text-center">
        <div className="bg-f1-red/20 border-2 border-f1-red rounded-lg py-3 px-6 inline-block">
          <span className="text-f1-red font-display font-semibold">TRACK VIEW</span>
        </div>
      </div>

      {/* Seat sections */}
      <div className="space-y-8">
        {Object.entries(filteredSections).map(([sectionName, sectionSeats]) => (
          <div key={sectionName} className="space-y-4">
            {/* Section header */}
            <div className="text-center">
              <h3 className="text-lg font-display font-semibold text-white">
                Section {sectionName}
              </h3>
              <div className="text-sm text-f1-gray">
                From ${Math.min(...sectionSeats.map(s => s.price))}
              </div>
            </div>

            {/* Seat grid */}
            <div className="flex justify-center">
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {sectionSeats.map((seat) => {
                  const status = getSeatStatus(seat.id);
                  const isHovered = hoveredSeat === seat.id;
                  
                  return (
                    <div
                      key={seat.id}
                      className="relative"
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                    >
                      <button
                        className={getSeatClassName(seat.id)}
                        onClick={() => handleSeatClick(seat)}
                        disabled={status === 'SOLD' || (status === 'HELD' && inventory.find(inv => inv.seatId === seat.id)?.holdUserId !== userId)}
                        aria-label={`Seat ${seat.section}${seat.row}-${seat.number}, $${seat.price}, ${status.toLowerCase()}`}
                      >
                        {seat.isAccessible ? (
                          <Wheelchair size={12} />
                        ) : (
                          `${seat.row}${seat.number}`
                        )}
                      </button>

                      {/* Hover tooltip */}
                      {isHovered && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                          <div className="bg-f1-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {seat.section}{seat.row}-{seat.number} • ${seat.price}
                            {seat.isAccessible && ' • Accessible'}
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-f1-black"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(filteredSections).length === 0 && (
        <div className="text-center py-12 text-f1-gray">
          <p>No seats match your current filters.</p>
          <p className="text-sm mt-2">Try adjusting your criteria above.</p>
        </div>
      )}
    </div>
  );
};