// src/lib/paystack.js
// Paystack payment helper

export const SERVICE_CHARGE_RATE = Number(import.meta.env.VITE_PLATFORM_FEE || 0.03); // 3%
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// Calculate fee breakdown
// Buyer pays item price + service charge
// Seller receives full item price
export function calculateFees(price) {
  const serviceCharge = Math.round(price * SERVICE_CHARGE_RATE);
  const buyerTotal = price + serviceCharge;  // what buyer pays
  const sellerAmount = price;                // seller gets full price
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

// Initialize Paystack popup
export function initializePaystack({ email, amount, reference, subaccountCode, onSuccess, onClose }) {
  if (!window.PaystackPop) {
    alert('Paystack failed to load. Please refresh and try again.');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: amount * 100, // Paystack uses kobo
    ref: reference,
    subaccount: subaccountCode,       // seller subaccount
    bearer: 'subaccount',             // seller bears Paystack fee
    transaction_charge: Math.round(amount * SERVICE_CHARGE_RATE * 100), // your 3% in kobo
    currency: 'NGN',
    callback: (response) => onSuccess(response),
    onClose: () => onClose?.(),
  });

  handler.openIframe();
}

// Nigerian banks list for subaccount creation
export const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Ecobank', code: '050' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kuda Bank', code: '50211' },
  { name: 'OPay', code: '999992' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Stanbic IBTC', code: '221' },
  { name: 'Standard Chartered', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];