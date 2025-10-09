/*
  # F1 Tickets Database Schema

  1. New Tables
    - `events` - F1 racing events (Grand Prix, Qualifying, etc.)
    - `seats` - Physical seat inventory with pricing
    - `seat_inventory` - Real-time seat availability status
    - `holds` - Temporary seat reservations with expiration
    - `orders` - Completed ticket purchases
    - `tickets` - Individual ticket records with QR codes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Public read access for events and seats
    - User-specific access for orders and tickets

  3. Features
    - Automatic timestamps
    - UUID primary keys
    - Foreign key constraints
    - Indexes for performance
*/


-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  date text NOT NULL,
  venue text NOT NULL,
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seats table (physical seat layout)
CREATE TABLE IF NOT EXISTS seats (
  id text PRIMARY KEY,
  section text NOT NULL,
  row text NOT NULL,
  number text NOT NULL,
  price integer NOT NULL,
  is_accessible boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Seat inventory (availability per event)
CREATE TABLE IF NOT EXISTS seat_inventory (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_id text NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'HELD', 'SOLD')),
  hold_id uuid,
  hold_user_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, seat_id)
);

-- Holds table (temporary reservations)
CREATE TABLE IF NOT EXISTS holds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_ids text[] NOT NULL,
  user_id text NOT NULL,
  expire_at timestamptz NOT NULL,
  status text DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONFIRMED')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_ids text[] NOT NULL,
  amount integer NOT NULL,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
  payment_request_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seat_id text NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  qr_code text NOT NULL UNIQUE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row-Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- === RLS Policies ===

-- Events: Public read access
CREATE POLICY "Events are publicly readable"
  ON events FOR SELECT
  TO public
  USING (true);

-- Seats: Public read access
CREATE POLICY "Seats are publicly readable"
  ON seats FOR SELECT
  TO public
  USING (true);

-- Seat inventory: Public read access
CREATE POLICY "Seat inventory is publicly readable"
  ON seat_inventory FOR SELECT
  TO public
  USING (true);

-- Seat inventory: Authenticated users can update
CREATE POLICY "Authenticated users can update seat inventory"
  ON seat_inventory FOR UPDATE
  TO authenticated
  USING (true);

-- Holds: Users can manage their own holds
CREATE POLICY "Users can manage their own holds"
  ON holds FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Orders: Users can manage their own orders
CREATE POLICY "Users can manage their own orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Tickets: Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- === Indexes for performance ===
CREATE INDEX IF NOT EXISTS idx_seat_inventory_event_id ON seat_inventory(event_id);
CREATE INDEX IF NOT EXISTS idx_seat_inventory_status ON seat_inventory(status);
CREATE INDEX IF NOT EXISTS idx_holds_user_id ON holds(user_id);
CREATE INDEX IF NOT EXISTS idx_holds_expire_at ON holds(expire_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);

-- === Sample Data ===

-- Sample events (UUIDs auto-generated)
INSERT INTO events (name, date, venue, image_url)
VALUES
  ('F1 Grand Prix — Sunday', 'Nov 23, 2025 • 3:00 PM', 'Las Vegas Street Circuit', '/f1.jpg?v=2'),
  ('F1 Qualifying — Las Vegas 2025', 'Nov 21, 2025 • 10:00 AM', 'Las Vegas Street Circuit', '/f1%20lights.jpg?v=2')
ON CONFLICT DO NOTHING;

-- Generate sample seats (programmatically)
DO $$
DECLARE
  section_name text;
  section_price integer;
  row_num integer;
  seat_num integer;
BEGIN
  FOR i IN 1..5 LOOP
    section_name := chr(64 + i); -- A, B, C, D, E
    section_price := CASE i
      WHEN 1 THEN 299
      WHEN 2 THEN 199
      WHEN 3 THEN 149
      WHEN 4 THEN 99
      ELSE 79
    END;

    FOR row_num IN 1..8 LOOP
      FOR seat_num IN 1..5 LOOP
        INSERT INTO seats (id, section, row, number, price, is_accessible)
        VALUES (
          section_name || row_num || '-' || seat_num,
          section_name,
          row_num::text,
          seat_num::text,
          section_price,
          random() < 0.05
        )
        ON CONFLICT (id) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Generate seat inventory for all events
DO $$
DECLARE
  event_record RECORD;
  seat_record RECORD;
  rand_val float;
  inventory_status text;
BEGIN
  FOR event_record IN SELECT id FROM events LOOP
    FOR seat_record IN SELECT id FROM seats LOOP
      rand_val := random();
      IF rand_val < 0.12 THEN
        inventory_status := 'SOLD';
      ELSIF rand_val < 0.15 THEN
        inventory_status := 'HELD';
      ELSE
        inventory_status := 'AVAILABLE';
      END IF;

      INSERT INTO seat_inventory (event_id, seat_id, status, hold_user_id)
      VALUES (
        event_record.id,
        seat_record.id,
        inventory_status,
        CASE WHEN inventory_status = 'HELD' THEN 'other-user' ELSE NULL END
      )
      ON CONFLICT (event_id, seat_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
