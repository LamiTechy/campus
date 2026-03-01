-- ============================================================
-- CampusPlug Payments & Orders Schema
-- Run this in Supabase SQL Editor AFTER the main schema
-- ============================================================

-- Add bank account fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number TEXT,
  ADD COLUMN IF NOT EXISTS account_name TEXT,
  ADD COLUMN IF NOT EXISTS paystack_subaccount_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE;

-- Add payment fields to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS accepts_online_payment BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fee_consent BOOLEAN DEFAULT FALSE;

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,           -- what buyer paid
  seller_amount NUMERIC(12,2) NOT NULL,    -- amount after 2% fee
  platform_fee NUMERIC(12,2) NOT NULL,     -- your 2% cut
  paystack_reference TEXT UNIQUE,
  paystack_subaccount TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'delivered', 'completed', 'disputed', 'refunded'
  )),
  delivery_confirmed_at TIMESTAMPTZ,
  auto_release_at TIMESTAMPTZ,             -- 48hrs after paid if buyer doesnt confirm
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their orders"
  ON public.orders FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their products"
  ON public.orders FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their orders"
  ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(paystack_reference);
