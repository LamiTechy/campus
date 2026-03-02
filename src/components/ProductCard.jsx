// src/components/ProductCard.jsx
import { useState } from 'react';
import { CheckCircle, Tag, Trash2, Clock, ShoppingCart, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { formatNaira, calculateFees } from '../lib/paystack';
import CheckoutModal from './CheckoutModal';
import { Link } from 'react-router-dom';

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
  const [imgIndex, setImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isOwner = user?.id === product.seller_id;
  const images = product.images?.filter(Boolean) || [];
  const hasMultipleImages = images.length > 1;
  const currentImage = !imgError && images.length > 0 ? images[imgIndex] : null;
  const condition = CONDITION_LABELS[product.condition] || CONDITION_LABELS['used'];
  const categoryColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS['Others'];

  const nextImage = (e) => {
    e.stopPropagation();
    setImgIndex(prev => (prev + 1) % images.length);
    setImgError(false);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setImgIndex(prev => (prev - 1 + images.length) % images.length);
    setImgError(false);
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

        {/* Image with gallery */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-gray-100 overflow-hidden group">
          {currentImage ? (
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag size={40} className="text-gray-300" />
            </div>
          )}

          {/* Image navigation arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={14} />
              </button>
              {/* Dots indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${condition.class}`}>
              {condition.label}
            </span>
          </div>

          <div className="absolute bottom-2 left-2">
            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-600 text-white">
              <Lock size={9} /> Secure Pay
            </span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
            >
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
          <div className="text-xl font-black text-green-600 mb-1">{formatNaira(product.price)}</div>
          {/* Quantity indicator */}
          {product.quantity > 0 && (
            <div className="mb-2">
              {product.quantity <= 3 ? (
                <span className="text-xs font-semibold text-red-500">
                  ⚠️ Only {product.quantity} left!
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {product.quantity} available
                </span>
              )}
            </div>
          )}

          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-auto">
            {/* Seller info — clickable to view all their listings */}
            <div className="flex items-center justify-between mb-2 text-xs text-gray-400">
              <Link
                to={`/seller/${product.seller_id}`}
                className="flex items-center gap-1 hover:text-green-600 transition-colors min-w-0"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-bold" style={{ fontSize: '8px' }}>
                    {product.profiles?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <span className="font-medium text-gray-600 truncate max-w-[60px]">
                  {product.profiles?.full_name || 'Seller'}
                </span>
                {product.profiles?.is_verified && <CheckCircle size={10} className="text-green-600 flex-shrink-0" />}
              </Link>
              <div className="flex items-center gap-0.5 flex-shrink-0 text-gray-400">
                <Clock size={10} />
                <span>{timeAgo(product.created_at)}</span>
              </div>
            </div>

            {/* Buy Now button — always shown, WhatsApp only after purchase */}
            {isOwner ? (
              <div className="w-full flex items-center justify-center py-2.5 bg-gray-100 text-gray-400 rounded-xl text-xs font-semibold">
                Your Listing
              </div>
            ) : product.quantity === 0 ? (
              // Out of stock
              <div className="w-full flex items-center justify-center py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-bold">
                Out of Stock
              </div>
            ) : !user ? (
              // Not logged in — prompt to login
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                style={{ fontSize: 'clamp(11px, 2.5vw, 14px)' }}
              >
                <ShoppingCart size={13} className="flex-shrink-0" />
                <span className="truncate">Login to Buy</span>
              </button>
            ) : (
              // Logged in — show Buy Now
              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                style={{ fontSize: 'clamp(11px, 2.5vw, 14px)' }}
              >
                <ShoppingCart size={13} className="flex-shrink-0" />
                <span className="truncate">Buy · {formatNaira(product.price)}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal product={product} onClose={() => setCheckoutOpen(false)} />
      )}
    </>
  );
}