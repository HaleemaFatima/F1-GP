export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  imageUrl: string;
}

export interface Seat {
  id: string;
  section: string;
  row: string;
  number: string;
  price: number;
  isAccessible?: boolean;
}

export type SeatStatus = 'AVAILABLE' | 'HELD' | 'SOLD' | 'SELECTED';

export interface SeatInventory {
  eventId: string;
  seatId: string;
  status: SeatStatus;
  holdId?: string;
  holdUserId?: string;
}

export interface Hold {
  id: string;
  eventId: string;
  seatIds: string[];
  userId: string;
  expireAt: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CONFIRMED';
}

export interface Order {
  id: string;
  userId: string;
  eventId: string;
  seatIds: string[];
  amount: number;
  status: 'PENDING' | 'PAID' | 'REFUNDED';
  createdAt: number;
}

export interface Ticket {
  id: string;
  eventId: string;
  seatId: string;
  userId: string;
  qrCode: string;
  orderId: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface SeatMapFilters {
  section?: string;
  maxPrice?: number;
  showAccessible?: boolean;
}