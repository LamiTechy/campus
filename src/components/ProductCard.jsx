// src/components/ProductCard.jsx
import { useState } from 'react';
import { MessageCircle, MapPin, Tag, CheckCircle, Trash2, Clock, ShoppingCart, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatNaira, calculateFees } from '../lib/paystack';
import CheckoutModal from './CheckoutModal';

const CATEGORY_COLORS = {
  'Electronics': 'bg-blue-50 text-blue-700',
  'Books & Stationery': 'bg-amber-50 text-amber-700',
  'Fashion & Clothing': 'bg-pink-50 text-pink-700',
  'Food & Drinks': 'bg-orange-50 text-orange-700',
  'Furniture': 'bg-stone-50 text-stone-700',
  'Services': 'bg-violet-50 text-violet-700',
  'Beauty & Health': 'bg-rose-50 text-rose-700',
  'Sports & Fitness': 'bg-cyan-50 text-cyan-700',
  'Others': 'bg-gray-50 text-gray-600',
};

const CONDITION_LABELS = {
  'new': { label: 'Brand New', class: 'bg-green-100 text-green-700' },
  'fairly-used': { label: 'Fairly Used', class: 'bg-yellow-100 text-yellow-700' },
  'used': { label: 'Used', class: 'bg-gray-100 text-gray-600' },
};

export default function ProductCard({ product, onDelete }) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isOwner = user?.id === product.seller_id;
  const imageUrl = !imgError && product.images?.length > 0 ? product.images[0] : null;
  const condition = CONDITION_LABELS[product.condition] || CONDITION_LABELS['used'];
  const categoryColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS['Others'];
  const fees = calculateFees(product.price);

  const handleWhatsApp = () => {
    const number = product.whatsapp_number.replace(/\D/g, '').replace(/^0/, '234');
    const msg = encodeURIComponent(`Hi! I saw your listing for *${product.name}* (${formatNaira(product.price)}) on CampusPlug. Is it still available?`);
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    await supabase.from('products').delete().eq('id', product.id);
    onDelete?.(product.id);
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-gray-100 overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag size={40} className="text-gray-300" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${condition.class}`}>
              {condition.label}
            </span>
          </div>
          {/* Online payment badge */}
          {product.accepts_online_payment && (
            <div className="absolute bottom-2 left-2">
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white">
                <Lock size={9} /> Secure Pay
              </span>
            </div>
          )}
          {isOwner && (
            <button onClick={handleDelete} disabled={deleting}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mb-2 ${categoryColor}`}>
            {product.category}
          </span>
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
          <div className="text-xl font-black text-green-600 mb-2">{formatNaira(product.price)}</div>

          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-auto">
            {/* Seller info */}
            <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-700 font-bold" style={{ fontSize: '9px' }}>
                    {product.profiles?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <span className="font-medium text-gray-600 truncate max-w-[80px]">
                  {product.profiles?.full_name || 'Seller'}
                </span>
                {product.profiles?.is_verified && <CheckCircle size={12} className="text-green-600 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo(product.created_at)}
              </div>
            </div>

            {product.university && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                <MapPin size={11} />
                <span className="truncate">{product.university}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-2">
              {/* Buy Now button — only if seller has subaccount and accepts online payment */}
              {product.accepts_online_payment && product.profiles?.paystack_subaccount_code && !isOwner && (
                <button
                  onClick={() => user ? setCheckoutOpen(true) : window.location.href = '/login'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  <ShoppingCart size={15} />
                  Buy Now · {formatNaira(product.price)}
                </button>
              )}
              {/* WhatsApp button */}
              <button onClick={handleWhatsApp}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  product.accepts_online_payment && !isOwner
                    ? 'border border-green-200 text-green-700 hover:bg-green-50'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                }`}>
                <MessageCircle size={15} />
                {product.accepts_online_payment && !isOwner ? 'Chat on WhatsApp' : 'Contact on WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          product={product}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}
