// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, MapPin, Clock, Shield, Package, Loader2, Share2, Tag } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { formatNaira } from '../lib/paystack';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';

const CONDITION_LABELS = {
  'new': { label: 'Brand New', class: 'bg-green-100 text-green-700' },
  'fairly-used': { label: 'Fairly Used', class: 'bg-yellow-100 text-yellow-700' },
  'used': { label: 'Used', class: 'bg-gray-100 text-gray-600' },
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchProduct(); }, [productId]);

  async function fetchProduct() {
    const { data } = await supabase
      .from('products')
      .select('*, profiles(full_name, is_verified, whatsapp_number, university)')
      .eq('id', productId)
      .single();
    setProduct(data);
    setLoading(false);
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={28} className="text-green-500 animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-3">
      <Package size={48} className="text-gray-300" />
      <p className="text-gray-500 font-semibold">Product not found</p>
      <button onClick={() => navigate('/')} className="text-green-600 text-sm font-semibold">← Back to Browse</button>
    </div>
  );

  const images = product.images?.filter(Boolean) || [];
  const condition = CONDITION_LABELS[product.condition] || CONDITION_LABELS['used'];
  const isOwner = user?.id === product.seller_id;
  const isVerified = profile?.is_verified;
  const isOutOfStock = product.quantity === 0;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">

          {/* Back button */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm font-medium mb-6 transition-colors">
            <ChevronLeft size={18} /> Back
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Image Gallery */}
            <div>
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3 group">
                {images.length > 0 ? (
                  <img
                    src={images[imgIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag size={48} className="text-gray-300" />
                  </div>
                )}

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIndex(p => (p - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setImgIndex(p => (p + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Condition badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${condition.class}`}>
                    {condition.label}
                  </span>
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIndex ? 'border-green-500' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-4">

              {/* Title + Share */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">{product.category}</p>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
                </div>
                <button
                  onClick={handleShare}
                  className="flex-shrink-0 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  title="Share listing"
                >
                  {copied ? <CheckCircle size={16} className="text-green-600" /> : <Share2 size={16} className="text-gray-500" />}
                </button>
              </div>

              {/* Price + Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-green-600">{formatNaira(product.price)}</span>
                {product.quantity > 0 ? (
                  product.quantity <= 3 ? (
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">⚠️ Only {product.quantity} left</span>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{product.quantity} available</span>
                  )
                ) : (
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">Out of Stock</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1"><Clock size={12} /> {timeAgo(product.created_at)}</div>
                {product.quantity_sold > 0 && (
                  <div className="flex items-center gap-1"><Package size={12} /> {product.quantity_sold} sold</div>
                )}
              </div>

              {/* Seller Card */}
              <Link to={`/seller/${product.seller_id}`} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-green-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-black text-sm">
                    {product.profiles?.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm">{product.profiles?.full_name || 'Seller'}</span>
                    {product.profiles?.is_verified && <CheckCircle size={13} className="text-green-600" />}
                  </div>
                  {product.profiles?.university && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <MapPin size={10} /> {product.profiles.university}
                    </div>
                  )}
                </div>
                <span className="text-xs text-green-600 font-semibold">View all →</span>
              </Link>

              {/* Secure Pay Badge */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Shield size={16} className="text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 leading-relaxed">
                  <strong>Secure Payment</strong> — Your money is held safely until you confirm delivery. 3% service charge added at checkout.
                </p>
              </div>

              {/* CTA Button */}
              {isOwner ? (
                <div className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl text-sm font-bold text-center">
                  This is your listing
                </div>
              ) : isOutOfStock ? (
                <div className="w-full py-4 bg-red-50 text-red-500 border border-red-200 rounded-xl text-sm font-bold text-center">
                  Out of Stock
                </div>
              ) : !user ? (
                <Link to="/login" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-black text-center flex items-center justify-center gap-2 transition-colors shadow-md">
                  Login to Buy · {formatNaira(product.price)}
                </Link>
              ) : (
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-colors shadow-md shadow-green-200"
                >
                  <Shield size={16} />
                  Buy Now · {formatNaira(product.price)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal product={product} onClose={() => setCheckoutOpen(false)} />
      )}
    </>
  );
}