import type { Event, Seat, SeatInventory, Hold, Order, Ticket } from '../types';

// Mock data
const events: Event[] = [
  {
    id: 'f1-gp-2025',
    name: 'F1 Grand Prix — Sunday',
    date: 'Nov 23, 2025 • 3:00 PM',
    venue: 'Las Vegas Street Circuit',
    imageUrl: '/f1.jpg?v=2'
  },
  {
    id: 'qualifying-2025',
    name: 'F1 Qualifying — Las Vegas 2025',
    date: 'Nov 21, 2025 • 10:00 AM',
    venue: 'Las Vegas Street Circuit',
    imageUrl: '/f1%20lights.jpg?v=2'
  }
];

const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const prices = [299, 199, 149, 99, 79];
  
  sections.forEach((section, sectionIndex) => {
    for (let row = 1; row <= 8; row++) {
      for (let number = 1; number <= 5; number++) {
        seats.push({
          id: `${section}${row}-${number}`,
          section,
          row: row.toString(),
          number: number.toString(),
          price: prices[sectionIndex],
          isAccessible: Math.random() < 0.05 // 5% wheelchair accessible
        });
      }
    }
  });
  
  return seats;
};

const seats = generateSeats();

// Generate initial inventory
const generateInventory = (): SeatInventory[] => {
  return seats.map(seat => {
    const rand = Math.random();
    let status: 'AVAILABLE' | 'HELD' | 'SOLD' = 'AVAILABLE';
    
    if (rand < 0.12) status = 'SOLD'; // 12% sold
    else if (rand < 0.15) status = 'HELD'; // 3% held
    
    return {
      eventId: 'f1-gp-2025',
      seatId: seat.id,
      status,
      holdId: status === 'HELD' ? `hold-${Date.now()}-${Math.random()}` : undefined,
      holdUserId: status === 'HELD' ? 'other-user' : undefined
    };
  });
};

let inventory = generateInventory();
let holds: Hold[] = [];
let orders: Order[] = [];
let tickets: Ticket[] = [];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  async getEvents(): Promise<Event[]> {
    await delay(300);
    return events;
  },

  async getEvent(id: string): Promise<Event | null> {
    await delay(200);
    return events.find(e => e.id === id) || null;
  },

  async getSeatMap(eventId: string): Promise<{ seats: Seat[], inventory: SeatInventory[] }> {
    await delay(400);
    return {
      seats,
      inventory: inventory.filter(inv => inv.eventId === eventId)
    };
  },

  async createHold(eventId: string, seatId: string, userId: string): Promise<{ holdId: string; expireAt: number } | { error: string }> {
    await delay(200);
    
    const seatInventory = inventory.find(inv => inv.eventId === eventId && inv.seatId === seatId);
    
    if (!seatInventory || seatInventory.status !== 'AVAILABLE') {
      return { error: 'seat_unavailable' };
    }

    const holdId = `hold-${Date.now()}-${Math.random()}`;
    const expireAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Update inventory
    seatInventory.status = 'HELD';
    seatInventory.holdId = holdId;
    seatInventory.holdUserId = userId;

    // Create hold record
    const hold: Hold = {
      id: holdId,
      eventId,
      seatIds: [seatId],
      userId,
      expireAt,
      status: 'ACTIVE'
    };
    
    holds.push(hold);

    return { holdId, expireAt };
  },

  async releaseHold(holdId: string): Promise<{ ok: boolean }> {
    await delay(100);
    
    const hold = holds.find(h => h.id === holdId);
    if (hold) {
      hold.status = 'EXPIRED';
      
      // Release seats in inventory
      hold.seatIds.forEach(seatId => {
        const seatInventory = inventory.find(inv => inv.holdId === holdId);
        if (seatInventory) {
          seatInventory.status = 'AVAILABLE';
          seatInventory.holdId = undefined;
          seatInventory.holdUserId = undefined;
        }
      });
    }
    
    return { ok: true };
  },

  async confirmHold(holdId: string, paymentRequestId: string): Promise<{ ticket: Ticket } | { error: string }> {
    await delay(800); // Simulate payment processing
    
    const hold = holds.find(h => h.id === holdId && h.status === 'ACTIVE');
    
    if (!hold) {
      return { error: 'hold_expired' };
    }

    if (Date.now() > hold.expireAt) {
      hold.status = 'EXPIRED';
      return { error: 'hold_expired' };
    }

    // Create order
    const seat = seats.find(s => s.id === hold.seatIds[0])!;
    const order: Order = {
      id: `order-${Date.now()}`,
      userId: hold.userId,
      eventId: hold.eventId,
      seatIds: hold.seatIds,
      amount: seat.price,
      status: 'PAID',
      createdAt: Date.now()
    };
    
    orders.push(order);

    // Mark hold as confirmed
    hold.status = 'CONFIRMED';

    // Update inventory to sold
    hold.seatIds.forEach(seatId => {
      const seatInventory = inventory.find(inv => inv.seatId === seatId && inv.holdId === holdId);
      if (seatInventory) {
        seatInventory.status = 'SOLD';
        seatInventory.holdId = undefined;
        seatInventory.holdUserId = undefined;
      }
    });

    // Create ticket
    const ticket: Ticket = {
      id: `ticket-${Date.now()}`,
      eventId: hold.eventId,
      seatId: hold.seatIds[0],
      userId: hold.userId,
      qrCode: `QR-${Date.now()}`,
      orderId: order.id
    };
    
    tickets.push(ticket);

    return { ticket };
  },

  async getOrders(userId: string): Promise<Order[]> {
    await delay(200);
    return orders.filter(o => o.userId === userId);
  },

  async getTickets(userId: string): Promise<Ticket[]> {
    await delay(200);
    return tickets.filter(t => t.userId === userId);
  },

  async getAdminData(): Promise<{
    activeHolds: Hold[];
    soldSeats: SeatInventory[];
    expiredHolds: Hold[];
    metrics: {
      totalSeats: number;
      soldSeats: number;
      heldSeats: number;
      availableSeats: number;
    };
  }> {
    await delay(300);
    
    const soldSeats = inventory.filter(inv => inv.status === 'SOLD');
    const heldSeats = inventory.filter(inv => inv.status === 'HELD');
    const availableSeats = inventory.filter(inv => inv.status === 'AVAILABLE');
    
    return {
      activeHolds: holds.filter(h => h.status === 'ACTIVE'),
      soldSeats,
      expiredHolds: holds.filter(h => h.status === 'EXPIRED'),
      metrics: {
        totalSeats: inventory.length,
        soldSeats: soldSeats.length,
        heldSeats: heldSeats.length,
        availableSeats: availableSeats.length
      }
    };
  }
};

// Auto-expire holds
setInterval(() => {
  const now = Date.now();
  holds.forEach(hold => {
    if (hold.status === 'ACTIVE' && now > hold.expireAt) {
      mockApi.releaseHold(hold.id);
    }
  });
}, 1000); // Check every second