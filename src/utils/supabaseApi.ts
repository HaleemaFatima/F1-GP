import { supabase } from '../lib/supabase';
import type { Event, Seat, SeatInventory, Hold, Order, Ticket } from '../types';

// Convert database types to app types
const mapDbEventToEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  name: dbEvent.name,
  date: dbEvent.date,
  venue: dbEvent.venue,
  imageUrl: dbEvent.image_url || ''
});

const mapDbSeatToSeat = (dbSeat: any): Seat => ({
  id: dbSeat.id,
  section: dbSeat.section,
  row: dbSeat.row,
  number: dbSeat.number,
  price: dbSeat.price,
  isAccessible: dbSeat.is_accessible
});

const mapDbInventoryToInventory = (dbInventory: any): SeatInventory => ({
  eventId: dbInventory.event_id,
  seatId: dbInventory.seat_id,
  status: dbInventory.status,
  holdId: dbInventory.hold_id,
  holdUserId: dbInventory.hold_user_id
});

const mapDbHoldToHold = (dbHold: any): Hold => ({
  id: dbHold.id,
  eventId: dbHold.event_id,
  seatIds: dbHold.seat_ids,
  userId: dbHold.user_id,
  expireAt: new Date(dbHold.expire_at).getTime(),
  status: dbHold.status
});

const mapDbOrderToOrder = (dbOrder: any): Order => ({
  id: dbOrder.id,
  userId: dbOrder.user_id,
  eventId: dbOrder.event_id,
  seatIds: dbOrder.seat_ids,
  amount: dbOrder.amount,
  status: dbOrder.status,
  createdAt: new Date(dbOrder.created_at).getTime()
});

const mapDbTicketToTicket = (dbTicket: any): Ticket => ({
  id: dbTicket.id,
  eventId: dbTicket.event_id,
  seatId: dbTicket.seat_id,
  userId: dbTicket.user_id,
  qrCode: dbTicket.qr_code,
  orderId: dbTicket.order_id
});

export const supabaseApi = {
  async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'active')
      .order('date');

    if (error) throw error;
    return data.map(mapDbEventToEvent);
  },

  async getEvent(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return mapDbEventToEvent(data);
  },

  async getSeatMap(eventId: string): Promise<{ seats: Seat[], inventory: SeatInventory[] }> {
    const [seatsResult, inventoryResult] = await Promise.all([
      supabase.from('seats').select('*').order('section, row, number'),
      supabase
        .from('seat_inventory')
        .select('*')
        .eq('event_id', eventId)
    ]);

    if (seatsResult.error) throw seatsResult.error;
    if (inventoryResult.error) throw inventoryResult.error;

    return {
      seats: seatsResult.data.map(mapDbSeatToSeat),
      inventory: inventoryResult.data.map(mapDbInventoryToInventory)
    };
  },

  async createHold(eventId: string, seatId: string, userId: string): Promise<{ holdId: string; expireAt: number } | { error: string }> {
    // Check if seat is available
    const { data: seatInventory, error: checkError } = await supabase
      .from('seat_inventory')
      .select('*')
      .eq('event_id', eventId)
      .eq('seat_id', seatId)
      .single();

    if (checkError) throw checkError;

    if (seatInventory.status !== 'AVAILABLE') {
      return { error: 'seat_unavailable' };
    }

    const expireAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const holdId = crypto.randomUUID();

    // Start transaction
    const { error: holdError } = await supabase
      .from('holds')
      .insert({
        id: holdId,
        event_id: eventId,
        seat_ids: [seatId],
        user_id: userId,
        expire_at: expireAt.toISOString(),
        status: 'ACTIVE'
      });

    if (holdError) throw holdError;

    // Update seat inventory
    const { error: updateError } = await supabase
      .from('seat_inventory')
      .update({
        status: 'HELD',
        hold_id: holdId,
        hold_user_id: userId,
        updated_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('seat_id', seatId)
      .eq('status', 'AVAILABLE'); // Only update if still available

    if (updateError) {
      // Rollback hold creation
      await supabase.from('holds').delete().eq('id', holdId);
      return { error: 'seat_unavailable' };
    }

    return { holdId, expireAt: expireAt.getTime() };
  },

  async releaseHold(holdId: string): Promise<{ ok: boolean }> {
    // Get hold details
    const { data: hold, error: holdError } = await supabase
      .from('holds')
      .select('*')
      .eq('id', holdId)
      .single();

    if (holdError) return { ok: false };

    // Update hold status
    await supabase
      .from('holds')
      .update({ status: 'EXPIRED', updated_at: new Date().toISOString() })
      .eq('id', holdId);

    // Release seats
    await supabase
      .from('seat_inventory')
      .update({
        status: 'AVAILABLE',
        hold_id: null,
        hold_user_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('hold_id', holdId);

    return { ok: true };
  },

  async confirmHold(holdId: string, paymentRequestId: string): Promise<{ ticket: Ticket } | { error: string }> {
    // Get hold details
    const { data: hold, error: holdError } = await supabase
      .from('holds')
      .select('*')
      .eq('id', holdId)
      .eq('status', 'ACTIVE')
      .single();

    if (holdError || !hold) {
      return { error: 'hold_expired' };
    }

    if (new Date(hold.expire_at).getTime() < Date.now()) {
      await this.releaseHold(holdId);
      return { error: 'hold_expired' };
    }

    // Get seat details for pricing
    const { data: seat, error: seatError } = await supabase
      .from('seats')
      .select('*')
      .eq('id', hold.seat_ids[0])
      .single();

    if (seatError) throw seatError;

    const orderId = crypto.randomUUID();
    const ticketId = crypto.randomUUID();
    const qrCode = `QR-${Date.now()}`;

    // Create order
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: hold.user_id,
        event_id: hold.event_id,
        seat_ids: hold.seat_ids,
        amount: seat.price + 5, // Add service fee
        status: 'PAID',
        payment_request_id: paymentRequestId
      });

    if (orderError) throw orderError;

    // Create ticket
    const { error: ticketError } = await supabase
      .from('tickets')
      .insert({
        id: ticketId,
        event_id: hold.event_id,
        seat_id: hold.seat_ids[0],
        user_id: hold.user_id,
        qr_code: qrCode,
        order_id: orderId
      });

    if (ticketError) throw ticketError;

    // Update hold status
    await supabase
      .from('holds')
      .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
      .eq('id', holdId);

    // Update seat inventory to sold
    await supabase
      .from('seat_inventory')
      .update({
        status: 'SOLD',
        hold_id: null,
        hold_user_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('hold_id', holdId);

    const ticket: Ticket = {
      id: ticketId,
      eventId: hold.event_id,
      seatId: hold.seat_ids[0],
      userId: hold.user_id,
      qrCode,
      orderId
    };

    return { ticket };
  },

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbOrderToOrder);
  },

  async getTickets(userId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbTicketToTicket);
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
    const [holdsResult, inventoryResult] = await Promise.all([
      supabase.from('holds').select('*').order('created_at', { ascending: false }),
      supabase.from('seat_inventory').select('*')
    ]);

    if (holdsResult.error) throw holdsResult.error;
    if (inventoryResult.error) throw inventoryResult.error;

    const holds = holdsResult.data.map(mapDbHoldToHold);
    const inventory = inventoryResult.data.map(mapDbInventoryToInventory);

    const activeHolds = holds.filter(h => h.status === 'ACTIVE');
    const expiredHolds = holds.filter(h => h.status === 'EXPIRED');
    const soldSeats = inventory.filter(inv => inv.status === 'SOLD');
    const heldSeats = inventory.filter(inv => inv.status === 'HELD');
    const availableSeats = inventory.filter(inv => inv.status === 'AVAILABLE');

    return {
      activeHolds,
      soldSeats,
      expiredHolds,
      metrics: {
        totalSeats: inventory.length,
        soldSeats: soldSeats.length,
        heldSeats: heldSeats.length,
        availableSeats: availableSeats.length
      }
    };
  }
};

// Auto-expire holds function (to be called periodically)
export const expireOldHolds = async () => {
  const { data: expiredHolds, error } = await supabase
    .from('holds')
    .select('id')
    .eq('status', 'ACTIVE')
    .lt('expire_at', new Date().toISOString());

  if (error) return;

  for (const hold of expiredHolds) {
    await supabaseApi.releaseHold(hold.id);
  }
};

// Set up periodic hold expiration (every 30 seconds)
if (typeof window !== 'undefined') {
  setInterval(expireOldHolds, 30000);
}