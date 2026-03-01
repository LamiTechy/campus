// src/pages/SellPage.jsx
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';

export default function SellPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">List an Item</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details and connect buyers via WhatsApp</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <ProductForm
            onSuccess={() => navigate('/dashboard')}
            onCancel={() => navigate('/dashboard')}
          />
        </div>
      </div>
    </div>
  );
}
