import { create } from 'zustand';
import type { Event, Seat, SeatInventory, Hold, Order, Ticket, Toast, SeatMapFilters } from '../types';

interface StoreState {
  // UI State
  isLoading: boolean;
  toasts: Toast[];
  selectedSeats: string[];
  currentHold: Hold | null;
  filters: SeatMapFilters;
  
  // Data
  events: Event[];
  currentEvent: Event | null;
  seats: Seat[];
  inventory: SeatInventory[];
  orders: Order[];
  tickets: Ticket[];
  
  // User
  userId: string;
  
  // Actions
  setLoading: (loading: boolean) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setSelectedSeats: (seatIds: string[]) => void;
  setCurrentHold: (hold: Hold | null) => void;
  setFilters: (filters: SeatMapFilters) => void;
  setEvents: (events: Event[]) => void;
  setCurrentEvent: (event: Event | null) => void;
  setSeatMap: (seats: Seat[], inventory: SeatInventory[]) => void;
  updateSeatStatus: (seatId: string, status: 'AVAILABLE' | 'HELD' | 'SOLD') => void;
  setOrders: (orders: Order[]) => void;
  setTickets: (tickets: Ticket[]) => void;
  clearCurrentBooking: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  isLoading: false,
  toasts: [],
  selectedSeats: [],
  currentHold: null,
  filters: {},
  events: [],
  currentEvent: null,
  seats: [],
  inventory: [],
  orders: [],
  tickets: [],
  userId: 'user-123', // Mock user ID
  
  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
  
  setSelectedSeats: (seatIds) => set({ selectedSeats: seatIds }),
  
  setCurrentHold: (hold) => set({ currentHold: hold }),
  
  setFilters: (filters) => set({ filters }),
  
  setEvents: (events) => set({ events }),
  
  setCurrentEvent: (event) => set({ currentEvent: event }),
  
  setSeatMap: (seats, inventory) => set({ seats, inventory }),
  
  updateSeatStatus: (seatId, status) => set((state) => ({
    inventory: state.inventory.map(inv => 
      inv.seatId === seatId 
        ? { ...inv, status, holdId: undefined, holdUserId: undefined }
        : inv
    )
  })),
  
  setOrders: (orders) => set({ orders }),
  
  setTickets: (tickets) => set({ tickets }),
  
  clearCurrentBooking: () => set({
    selectedSeats: [],
    currentHold: null
  })
}));