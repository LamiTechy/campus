// src/lib/flutterwave.js
export const SERVICE_CHARGE_RATE = Number(import.meta.env.VITE_PLATFORM_FEE || 0.03);
export const FLW_PUBLIC_KEY = import.meta.env.VITE_FLW_PUBLIC_KEY;

export function calculateFees(price) {
  const serviceCharge = Math.round(price * SERVICE_CHARGE_RATE);
  const buyerTotal = price + serviceCharge;
  const sellerAmount = price;
  return { price, serviceCharge, buyerTotal, sellerAmount };
}

export function formatNaira(amount) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
  }).format(amount);
}

export function initializeFlutterwave({ email, amount, reference, name, phone, subaccountId, onSuccess, onClose }) {
  if (!window.FlutterwaveCheckout) {
    alert('Flutterwave failed to load. Please refresh and try again.');
    return;
  }

  const config = {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: reference,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer,mobilemoney',
    customer: { email, name: name || 'Customer', phone_number: phone || '' },
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
    onclose: () => onClose?.(),
  };

  // Split payment — seller gets 97%, CampusPlug keeps 3%
  if (subaccountId) {
    config.subaccounts = [{ id: subaccountId, transaction_split_ratio: 97 }];
  }

  window.FlutterwaveCheckout(config);
}

// Full Nigerian Banks list for Flutterwave
// code       = used for account VERIFICATION (resolve API)
// transferCode = used for TRANSFERS (payout API)
export const NIGERIAN_BANKS = [
  { name: 'Abbey Mortgage Bank',        code: '801',    transferCode: '801' },
  { name: 'Access Bank',                code: '044',    transferCode: '044' },
  { name: 'Carbon (One Finance)',        code: '565',    transferCode: '565' },
  { name: 'Citibank',                   code: '023',    transferCode: '023' },
  { name: 'Ecobank',                    code: '050',    transferCode: '050' },
  { name: 'Fidelity Bank',              code: '070',    transferCode: '070' },
  { name: 'First Bank of Nigeria',      code: '011',    transferCode: '011' },
  { name: 'FCMB',                       code: '214',    transferCode: '214' },
  { name: 'Globus Bank',                code: '00103',  transferCode: '00103' },
  { name: 'GTBank',                     code: '058',    transferCode: '058' },
  { name: 'Heritage Bank',              code: '030',    transferCode: '030' },
  { name: 'Jaiz Bank',                  code: '301',    transferCode: '301' },
  { name: 'Keystone Bank',              code: '082',    transferCode: '082' },
  { name: 'Kuda Microfinance Bank',     code: '50211',  transferCode: '50211' },
  { name: 'Lotus Bank',                 code: '303',    transferCode: '303' },
  { name: 'Moniepoint Microfinance Bank', code: 'MPS',  transferCode: '50515' },
  { name: 'OPay Digital Services',      code: '999992', transferCode: '999992' },
  { name: 'PalmPay',                    code: '999991', transferCode: '999991' },
  { name: 'Parallex Bank',              code: '526',    transferCode: '526' },
  { name: 'Polaris Bank',               code: '076',    transferCode: '076' },
  { name: 'Providus Bank',              code: '101',    transferCode: '101' },
  { name: 'Rubies Microfinance Bank',   code: '125',    transferCode: '125' },
  { name: 'Smartcash PSB',              code: '100032', transferCode: '100032' },
  { name: 'Sparkle Microfinance Bank',  code: '51310',  transferCode: '51310' },
  { name: 'Stanbic IBTC',              code: '221',    transferCode: '221' },
  { name: 'Standard Chartered',         code: '068',    transferCode: '068' },
  { name: 'Sterling Bank',              code: '232',    transferCode: '232' },
  { name: 'TAJ Bank',                   code: '302',    transferCode: '302' },
  { name: 'Titan Trust Bank',           code: '102',    transferCode: '102' },
  { name: 'Union Bank',                 code: '032',    transferCode: '032' },
  { name: 'UBA',                        code: '033',    transferCode: '033' },
  { name: 'Unity Bank',                 code: '215',    transferCode: '215' },
  { name: 'VFD Microfinance Bank',      code: '566',    transferCode: '566' },
  { name: 'Wema Bank',                  code: '035',    transferCode: '035' },
  { name: 'Zenith Bank',                code: '057',    transferCode: '057' },
];