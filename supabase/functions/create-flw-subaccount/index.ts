// supabase/functions/create-flw-subaccount/index.ts
// Creates a Flutterwave subaccount for the seller
// Called when seller saves their bank account in ProfilePage

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FLW_SECRET = Deno.env.get('FLW_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { user_id, account_bank, account_number, business_name, business_email } = await req.json();

    if (!user_id || !account_bank || !account_number || !business_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1 — Create subaccount on Flutterwave
    const flwRes = await fetch('https://api.flutterwave.com/v3/subaccounts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank,        // bank code e.g. "044" for Access Bank
        account_number,      // 10-digit account number
        business_name,       // seller's account name
        business_email: business_email || 'seller@campusplug.com',
        business_mobile: '0800000000',
        country: 'NG',
        split_type: 'percentage',
        split_value: 0.97,   // seller gets 97%, CampusPlug keeps 3%
      }),
    });

    const flwData = await flwRes.json();
    console.log('Flutterwave subaccount response:', flwData);

    if (flwData.status !== 'success') {
      return new Response(JSON.stringify({ error: flwData.message || 'Failed to create subaccount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subaccountId = flwData.data.subaccount_id; // e.g. RS_xxxxxxxxxxxxxxxx

    // Step 2 — Save subaccount ID to Supabase profile
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { error: dbError } = await supabase
      .from('profiles')
      .update({ flw_subaccount_id: subaccountId })
      .eq('id', user_id);

    if (dbError) {
      return new Response(JSON.stringify({
        error: 'Subaccount created but failed to save: ' + dbError.message,
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      subaccount_id: subaccountId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});