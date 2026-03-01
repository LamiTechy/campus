# Setting Up the Payment Email Edge Function

This function sends emails to both buyer and seller after a successful payment.

## Step 1 — Install Supabase CLI
```bash
npm install -g supabase
```

## Step 2 — Login to Supabase
```bash
npx supabase login
```

## Step 3 — Link your project
```bash
npx supabase link --project-ref udtvrlnrxdcnguyltnbr
```
(Replace with your actual project ref from your Supabase URL)

## Step 4 — Set environment variables
```bash
npx supabase secrets set RESEND_API_KEY=re_your_resend_key_here
npx supabase secrets set FROM_EMAIL=noreply@campusplug.com.ng
npx supabase secrets set APP_URL=https://campusplug.com.ng
```

## Step 5 — Deploy the function
```bash
npx supabase functions deploy send-payment-emails
```

## Step 6 — Test it
```bash
npx supabase functions invoke send-payment-emails --body '{
  "buyerEmail": "buyer@test.com",
  "buyerName": "Test Buyer",
  "sellerEmail": "seller@test.com",
  "sellerName": "Test Seller",
  "productName": "iPhone 13 Pro",
  "amount": "₦150,000",
  "sellerPhone": "08012345678",
  "buyerPhone": "08098765432",
  "reference": "CP_TEST_123"
}'
```

## What the emails contain

### Buyer gets:
- Payment confirmation
- 🔒 Clear notice that money is HELD and not yet with seller
- Seller's name + WhatsApp number displayed clearly
- Direct "Chat on WhatsApp" button linking to seller
- Step-by-step instructions to confirm delivery

### Seller gets:
- New sale notification
- ⏳ Notice that payment is held pending buyer confirmation
- Buyer's name + WhatsApp number
- Direct "Chat with Buyer" WhatsApp button
- Instructions to arrange delivery
