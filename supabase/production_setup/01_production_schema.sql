-- ==============================================================================
-- Production SQL Script 01: Complete Database Schema, Functions, Indexes & RLS
-- Project: Vasu Crackers (Sivakasi Direct Fireworks E-Commerce Outlet)
-- Target: Supabase PostgreSQL 15
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PACKING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE movement_type AS ENUM ('PURCHASE', 'RESERVATION', 'SALE', 'CANCELLATION', 'DAMAGE', 'ADJUSTMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    pack_size VARCHAR(100),
    mrp DECIMAL(10, 2) NOT NULL CHECK (mrp >= 0),
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    sound_level VARCHAR(50) DEFAULT 'Medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    available_stock INT NOT NULL DEFAULT 0 CHECK (available_stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    safety_threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVENTORY MOVEMENTS AUDIT LOG
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type movement_type NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMBOS & COMBO ITEMS
CREATE TABLE IF NOT EXISTS combos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    mrp DECIMAL(10, 2) NOT NULL CHECK (mrp >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- 9. ORDERS & ORDER ITEMS
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL,
    status order_status DEFAULT 'PENDING',
    admin_notes TEXT,
    courier_partner VARCHAR(100),
    tracking_number VARCHAR(100),
    estimated_delivery VARCHAR(50),
    is_paid BOOLEAN DEFAULT false,
    payment_method VARCHAR(50) DEFAULT 'COD',
    tags TEXT[] DEFAULT '{}',
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2)
);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2);

-- 10. DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_name VARCHAR(100) NOT NULL,
    state_codes TEXT[] NOT NULL,
    min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 3000.00,
    delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estimated_days VARCHAR(50) DEFAULT '2-3 Days',
    is_active BOOLEAN DEFAULT true
);

-- 11. BILLS & BILL ITEMS (COUNTER BILLING & POS)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_mobile VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    shipping_address TEXT NOT NULL DEFAULT 'Direct Warehouse Pickup',
    city VARCHAR(100) NOT NULL DEFAULT 'Sivakasi',
    state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
    pincode VARCHAR(20) NOT NULL DEFAULT '626123',
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    grand_total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    is_paid BOOLEAN DEFAULT true,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    product_id REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    pack_size VARCHAR(50),
    mrp DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2);

-- ==============================================================================
-- 12. HIGH-SPEED INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_mobile ON orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_bill_number ON bills(bill_number);
CREATE INDEX IF NOT EXISTS idx_bills_customer_mobile ON bills(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_bills_is_paid ON bills(is_paid);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items(product_id);

-- ==============================================================================
-- 13. SEQUENCES & HELPER FUNCTIONS
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS order_seq START 1001;

CREATE OR REPLACE FUNCTION next_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'VPP-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS bill_seq START 1001;

CREATE OR REPLACE FUNCTION next_bill_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'BILL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('bill_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reserve_order_inventory(
    p_items JSONB
) RETURNS BOOLEAN AS $$
DECLARE
    item RECORD;
    v_available INT;
BEGIN
    FOR item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(product_id UUID, quantity INT)
    LOOP
        SELECT available_stock INTO v_available 
        FROM inventory 
        WHERE product_id = item.product_id
        FOR UPDATE;

        IF v_available IS NULL OR v_available < item.quantity THEN
            RAISE EXCEPTION 'Insufficient stock for product %', item.product_id;
        END IF;

        UPDATE inventory 
        SET available_stock = available_stock - item.quantity,
            reserved_stock = reserved_stock + item.quantity
        WHERE product_id = item.product_id;

        INSERT INTO inventory_movements (product_id, type, quantity, reason)
        VALUES (item.product_id, 'RESERVATION', item.quantity, 'Order placement stock reservation');
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to prevent conflicts on re-execution
DROP POLICY IF EXISTS "Public store_settings read" ON store_settings;
DROP POLICY IF EXISTS "Admin store_settings write" ON store_settings;
DROP POLICY IF EXISTS "Public categories read" ON categories;
DROP POLICY IF EXISTS "Admin categories full access" ON categories;
DROP POLICY IF EXISTS "Public products read" ON products;
DROP POLICY IF EXISTS "Admin products full access" ON products;
DROP POLICY IF EXISTS "Public inventory read" ON inventory;
DROP POLICY IF EXISTS "Admin inventory full access" ON inventory;
DROP POLICY IF EXISTS "Public inventory_movements read" ON inventory_movements;
DROP POLICY IF EXISTS "Admin inventory_movements full access" ON inventory_movements;
DROP POLICY IF EXISTS "Public combos read" ON combos;
DROP POLICY IF EXISTS "Admin combos full access" ON combos;
DROP POLICY IF EXISTS "Public combo_items read" ON combo_items;
DROP POLICY IF EXISTS "Admin combo_items full access" ON combo_items;
DROP POLICY IF EXISTS "Public delivery_zones read" ON delivery_zones;
DROP POLICY IF EXISTS "Admin delivery_zones write" ON delivery_zones;
DROP POLICY IF EXISTS "Public orders insert" ON orders;
DROP POLICY IF EXISTS "Public orders read own" ON orders;
DROP POLICY IF EXISTS "Admin orders full access" ON orders;
DROP POLICY IF EXISTS "Public order_items insert" ON order_items;
DROP POLICY IF EXISTS "Public order_items read" ON order_items;
DROP POLICY IF EXISTS "Admin order_items full access" ON order_items;
DROP POLICY IF EXISTS "Allow read bills" ON bills;
DROP POLICY IF EXISTS "Allow insert bills" ON bills;
DROP POLICY IF EXISTS "Allow update bills" ON bills;
DROP POLICY IF EXISTS "Allow delete bills" ON bills;
DROP POLICY IF EXISTS "Allow read bill_items" ON bill_items;
DROP POLICY IF EXISTS "Allow insert bill_items" ON bill_items;
DROP POLICY IF EXISTS "Allow update bill_items" ON bill_items;
DROP POLICY IF EXISTS "Allow delete bill_items" ON bill_items;

-- Storefront Public Read Policies
CREATE POLICY "Public store_settings read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public inventory read" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public inventory_movements read" ON inventory_movements FOR SELECT USING (true);
CREATE POLICY "Public combos read" ON combos FOR SELECT USING (is_active = true);
CREATE POLICY "Public combo_items read" ON combo_items FOR SELECT USING (true);
CREATE POLICY "Public delivery_zones read" ON delivery_zones FOR SELECT USING (true);

-- Checkout Public Order Placement Policies
CREATE POLICY "Public orders insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public orders read own" ON orders FOR SELECT USING (true);
CREATE POLICY "Public order_items insert" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public order_items read" ON order_items FOR SELECT USING (true);

-- Authenticated Admin Management Policies
CREATE POLICY "Admin store_settings write" ON store_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin categories full access" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin products full access" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin inventory full access" ON inventory FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin inventory_movements full access" ON inventory_movements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin combos full access" ON combos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin combo_items full access" ON combo_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delivery_zones write" ON delivery_zones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin orders full access" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin order_items full access" ON order_items FOR ALL USING (auth.role() = 'authenticated');

-- POS Counter Billing Policies
CREATE POLICY "Allow read bills" ON bills FOR SELECT USING (true);
CREATE POLICY "Allow insert bills" ON bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update bills" ON bills FOR UPDATE USING (true);
CREATE POLICY "Allow delete bills" ON bills FOR DELETE USING (true);

CREATE POLICY "Allow read bill_items" ON bill_items FOR SELECT USING (true);
CREATE POLICY "Allow insert bill_items" ON bill_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update bill_items" ON bill_items FOR UPDATE USING (true);
CREATE POLICY "Allow delete bill_items" ON bill_items FOR DELETE USING (true);
