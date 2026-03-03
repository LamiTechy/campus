// src/lib/paystack.js
// Paystack payment helper

export const SERVICE_CHARGE_RATE = Number(import.meta.env.VITE_PLATFORM_FEE || 0.03); // 3%
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

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
    currency: 'NGN',
    callback: (response) => onSuccess(response),
    onClose: () => onClose?.(),
  });

  handler.openIframe();
}

// Nigerian banks list — Full list sorted alphabetically
export const NIGERIAN_BANKS = [
  { name: 'Abbey Mortgage Bank', code: '801' },
  { name: 'Access Bank', code: '044' },
  { name: 'Access Bank (Diamond)', code: '063' },
  { name: 'Accion Microfinance Bank', code: '602' },
  { name: 'ASO Savings & Loans', code: '401' },
  { name: 'Carbon (One Finance)', code: '565' },
  { name: 'CEMCS Microfinance Bank', code: '50823' },
  { name: 'Citibank', code: '023' },
  { name: 'Coronation Merchant Bank', code: '559' },
  { name: 'Ecobank', code: '050' },
  { name: 'Ekondo Microfinance Bank', code: '562' },
  { name: 'Eyowo', code: '50126' },
  { name: 'Fidelity Bank', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank (FCMB)', code: '214' },
  { name: 'FSDH Merchant Bank', code: '501' },
  { name: 'Globus Bank', code: '00103' },
  { name: 'GoMoney', code: '100022' },
  { name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { name: 'Hackman Microfinance Bank', code: '51251' },
  { name: 'Hasal Microfinance Bank', code: '50383' },
  { name: 'Heritage Bank', code: '030' },
  { name: 'Ibile Microfinance Bank', code: '51244' },
  { name: 'Infinity Microfinance Bank', code: '50457' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank', code: '082' },
  { name: 'Kredi Money Microfinance Bank', code: '50200' },
  { name: 'Kuda Microfinance Bank', code: '50211' },
  { name: 'Lagos Building Investment Company', code: '90052' },
  { name: 'Links Microfinance Bank', code: '50549' },
  { name: 'Lotus Bank', code: '303' },
  { name: 'Mayfair Microfinance Bank', code: '51356' },
  { name: 'Mint Finex MFB', code: '51281' },
  { name: 'Moniepoint Microfinance Bank', code: '50515' },
  { name: 'Nova Merchant Bank', code: '561' },
  { name: 'OPay Digital Services', code: '999992' },
  { name: 'Paga', code: '100002' },
  { name: 'PalmPay', code: '999991' },
  { name: 'Parallex Bank', code: '526' },
  { name: 'Parkway (ReadyCash)', code: '311' },
  { name: 'Paycom (Opay)', code: '999992' },
  { name: 'Petra Microfinance Bank', code: '50746' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Providus Bank', code: '101' },
  { name: 'Rand Merchant Bank', code: '502' },
  { name: 'Rubies Microfinance Bank', code: '125' },
  { name: 'Smartcash Payment Service Bank', code: '100015' },
  { name: 'Sparkle Microfinance Bank', code: '51310' },
  { name: 'Stanbic IBTC Bank', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Suntrust Bank', code: '100'  },
  { name: 'TAJ Bank', code: '302' },
  { name: 'Tangerine Money MFB', code: '51269' },
  { name: 'Titan Trust Bank', code: '102' },
  { name: 'Union Bank', code: '032' },
  { name: 'United Bank for Africa (UBA)', code: '033' },
  { name: 'Unity Bank', code: '215' },
  { name: 'VFD Microfinance Bank', code: '566' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' },
];