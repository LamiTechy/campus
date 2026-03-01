// supabase/functions/send-payment-emails/index.ts
// Deploy this with: npx supabase functions deploy send-payment-emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@campusplug.com.ng';
const APP_URL = Deno.env.get('APP_URL') || 'https://campusplug.com.ng';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: `CampusPlug <${FROM_EMAIL}>`, to, subject, html }),
  });
  return res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { buyerEmail, buyerName, sellerEmail, sellerName, productName, amount, sellerPhone, buyerPhone, reference } = await req.json();

    // ── EMAIL TO BUYER ──
    const buyerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,sans-serif;">
      <div style="max-width:560px;margin:40px auto;padding:20px;">
        <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">🎉</div>
            <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0;">Payment Confirmed!</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;">Your money is safely held by CampusPlug</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:15px;color:#374151;">Hi <strong>${buyerName}</strong>,</p>
            <p style="font-size:15px;color:#374151;line-height:1.6;">
              Your payment of <strong style="color:#16a34a;">${amount}</strong> for <strong>${productName}</strong> has been received and is safely held by CampusPlug.
            </p>

            <!-- Money held notice -->
            <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                🔒 <strong>Your money is NOT yet with the seller.</strong> It will only be released once you confirm you received the item in the app.
              </p>
            </div>

            <!-- Seller contact -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Seller Contact Details</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#111827;">${sellerName}</p>
              <p style="margin:0 0 12px;font-size:14px;color:#374151;">📱 WhatsApp: <strong>${sellerPhone}</strong></p>
              <a href="https://wa.me/${sellerPhone.replace(/\D/g,'').replace(/^0/,'234')}?text=${encodeURIComponent(`Hi ${sellerName}! I just paid for ${productName} on CampusPlug (Ref: ${reference}). Let's arrange pickup!`)}"
                style="display:inline-block;background:#16a34a;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
                💬 Chat on WhatsApp
              </a>
            </div>

            <!-- Next steps -->
            <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:8px;">What to do next:</p>
            <ol style="font-size:13px;color:#4b5563;line-height:2;padding-left:20px;margin:0 0 20px;">
              <li>Contact the seller on WhatsApp to arrange pickup</li>
              <li>Meet and collect your item</li>
              <li>Open CampusPlug → My Orders</li>
              <li>Tap <strong>"I Received This Item"</strong> to release payment</li>
            </ol>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#15803d;">Reference: <strong style="font-family:monospace;">${reference}</strong></p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© 2025 CampusPlug · Nigeria's Campus Marketplace</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    // ── EMAIL TO SELLER ──
    const sellerHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/></head>
    <body style="margin:0;padding:0;background:#f0fdf4;font-family:-apple-system,sans-serif;">
      <div style="max-width:560px;margin:40px auto;padding:20px;">
        <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">💰</div>
            <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0;">You Have a New Sale!</h1>
            <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;">Payment received for your listing</p>
          </div>
          <div style="padding:32px;">
            <p style="font-size:15px;color:#374151;">Hi <strong>${sellerName}</strong>,</p>
            <p style="font-size:15px;color:#374151;line-height:1.6;">
              Great news! <strong>${buyerName}</strong> just paid <strong style="color:#16a34a;">${amount}</strong> for your listing: <strong>${productName}</strong>.
            </p>

            <!-- Money held notice -->
            <div style="background:#dbeafe;border:1px solid #93c5fd;border-radius:12px;padding:16px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#1e40af;line-height:1.6;">
                ⏳ <strong>Payment is being held securely</strong> by CampusPlug. You will receive <strong>${amount}</strong> once the buyer confirms they received the item.
              </p>
            </div>

            <!-- Buyer contact -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Buyer Contact Details</p>
              <p style="margin:0 0 4px;font-size:15px;font-weight:800;color:#111827;">${buyerName}</p>
              <p style="margin:0 0 12px;font-size:14px;color:#374151;">📱 WhatsApp: <strong>${buyerPhone}</strong></p>
              <a href="https://wa.me/${buyerPhone.replace(/\D/g,'').replace(/^0/,'234')}?text=${encodeURIComponent(`Hi ${buyerName}! I saw you paid for ${productName} on CampusPlug. Let's arrange pickup!`)}"
                style="display:inline-block;background:#16a34a;color:#fff;padding:10px 20px;border-radius:10px;text-decoration:none;font-weight:700;font-size:13px;">
                💬 Chat with Buyer
              </a>
            </div>

            <p style="font-size:13px;font-weight:700;color:#374151;margin-bottom:8px;">What to do next:</p>
            <ol style="font-size:13px;color:#4b5563;line-height:2;padding-left:20px;margin:0 0 20px;">
              <li>Contact the buyer on WhatsApp to arrange delivery</li>
              <li>Hand over the item safely</li>
              <li>Wait for buyer to confirm receipt</li>
              <li>Your money will be transferred to your bank account</li>
            </ol>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:12px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#15803d;">Reference: <strong style="font-family:monospace;">${reference}</strong></p>
            </div>
          </div>
          <div style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© 2025 CampusPlug · Nigeria's Campus Marketplace</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

    // Send both emails in parallel
    await Promise.all([
      sendEmail(buyerEmail, `✅ Payment confirmed for ${productName} — Contact seller now`, buyerHtml),
      sendEmail(sellerEmail, `💰 New sale! ${buyerName} paid for ${productName}`, sellerHtml),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
