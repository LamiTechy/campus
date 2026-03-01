# CampusPlug 🇳🇬

A marketplace for Nigerian students to buy and sell on campus.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
cd campusplug
npm install
```

### 2. Set Up Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste and run `supabase_schema.sql`
3. Go to **Storage** → create two buckets:
   - `product-images` (Public)
   - `student-ids` (Private)

### 3. Configure Environment
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key from **Settings → API**.

### 4. Run
```bash
npm run dev
```

---

## 📁 Project Structure

```
src/
├── lib/
│   └── supabaseClient.js      # Supabase client + uploadFile helper
├── context/
│   └── AuthContext.jsx        # Auth state (user, profile, signIn/signUp/signOut)
├── components/
│   ├── Navbar.jsx             # Sticky nav with mobile menu
│   ├── ProductCard.jsx        # Product display card with WhatsApp button
│   └── ProductForm.jsx        # Multi-field form with image upload
├── pages/
│   ├── HomePage.jsx           # Product feed with search & category filters
│   ├── AuthPage.jsx           # Login + Sign Up forms
│   ├── DashboardPage.jsx      # Seller's listings with stats
│   ├── SellPage.jsx           # New listing page
│   └── ProfilePage.jsx        # Profile editor + KYC verification
└── App.jsx                    # Router + Protected/Guest routes
```

---

## 🗄️ Database Schema

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | FK → auth.users |
| email | TEXT | From auth |
| full_name | TEXT | |
| whatsapp_number | TEXT | |
| university | TEXT | |
| student_id_url | TEXT | KYC document URL |
| is_verified | BOOLEAN | Set by admin after review |
| verification_status | TEXT | unverified / pending / verified / rejected |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| seller_id | UUID | FK → profiles |
| name | TEXT | |
| description | TEXT | |
| price | NUMERIC | In Naira |
| category | TEXT | ENUM of 9 categories |
| condition | TEXT | new / fairly-used / used |
| images | TEXT[] | Array of storage URLs |
| whatsapp_number | TEXT | Shown on WhatsApp button |
| university | TEXT | |
| is_available | BOOLEAN | |

---

## ✅ Features

- 🔐 **Auth** — Email sign up / login via Supabase Auth
- 🛍️ **Product Feed** — Responsive grid with search, category, and sort filters
- 💬 **WhatsApp Integration** — Pre-filled message linking directly to seller
- 📦 **Seller Dashboard** — Stats overview, listing management, delete
- 📸 **Image Upload** — Up to 4 images per listing via Supabase Storage
- 🎓 **KYC Verification** — Student ID upload → pending → verified badge
- 🟢 **Verified Badge** — Green checkmark on verified seller listings
- 📱 **Mobile First** — Fully responsive, clean green & white theme

---

## 🔧 Admin: Approving Verifications

To approve student verifications, run this SQL in Supabase:
```sql
UPDATE profiles 
SET is_verified = TRUE, verification_status = 'verified' 
WHERE id = 'user-uuid-here';
```
