// src/lib/flutterwave.js
// Flutterwave payment helper — replaces paystack.js

export const SERVICE_CHARGE_RATE = Number(import.meta.env.VITE_PLATFORM_FEE || 0.03); // 3%
export const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY;

// Calculate fee breakdown
// Buyer pays item price + service charge
// Seller receives full item price
export function calculateFees(price) {
  const serviceCharge = Math.round(price * SERVICE_CHARGE_RATE);
  const buyerTotal = price + serviceCharge;
  const sellerAmount = price;
  return { price, serviceCharge, buyerTotal, sellerAmount };
}

// Format Naira
export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Initialize Flutterwave popup with subaccount support
export function initializeFlutterwave({
  email, amount, reference, name, phone,
  subaccountId, onSuccess, onClose
}) {
  if (!window.FlutterwaveCheckout) {
    alert('Flutterwave failed to load. Please refresh and try again.');
    return;
  }

  const config = {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: reference,
    amount: amount, // Flutterwave uses full Naira (not kobo)
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer,mobilemoney',
    customer: {
      email,
      name: name || 'Customer',
      phone_number: phone || '',
    },
    customizations: {
      title: 'CampusPlug',
      description: 'Secure campus marketplace payment',
      logo: '',
    },
    callback: (response) => {
      if (response.status === 'successful' || response.status === 'completed') {
        onSuccess(response);
      }
    },
    onclose: () => {
      onClose?.();
    },
  };

  // Add subaccount split if seller has one
  if (subaccountId) {
    config.subaccounts = [
      {
        id: subaccountId,           // Flutterwave subaccount ID e.g. RS_XXXX
        transaction_split_ratio: 97, // seller gets 97%
      },
    ];
  }

  window.FlutterwaveCheckout(config);
}

// Nigerian Banks for subaccount creation
export const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Ecobank', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank', code: '011' },
  { name: 'FCMB', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'GTBank', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Moniepoint', code: '50515' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank', code: '032' },
  { name: 'UBA', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];