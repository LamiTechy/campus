-- ============================================================
-- CampusPlug Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  whatsapp_number TEXT,
  university TEXT,
  avatar_url TEXT,
  student_id_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL CHECK (category IN (
    'Electronics', 'Books & Stationery', 'Fashion & Clothing',
    'Food & Drinks', 'Furniture', 'Services', 'Beauty & Health',
    'Sports & Fitness', 'Others'
  )),
  condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used', 'fairly-used')),
  images TEXT[] DEFAULT '{}',
  whatsapp_number TEXT NOT NULL,
  university TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert products"
  ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own products"
  ON public.products FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own products"
  ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- ============================================================
-- STORAGE BUCKETS
-- Run these separately in Supabase Storage settings or SQL
-- ============================================================

-- Product images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE);

-- Student ID bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('student-ids', 'student-ids', FALSE);

-- Storage Policies for product-images
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own product images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policies for student-ids
CREATE POLICY "Users can upload their own student ID"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'student-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own student ID"
  ON storage.objects FOR SELECT USING (
    bucket_id = 'student-ids' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_is_available ON public.products(is_available);
