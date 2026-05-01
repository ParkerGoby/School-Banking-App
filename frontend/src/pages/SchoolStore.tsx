import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Student } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';

export default function SchoolStore() {
  const { currentUser, storeItems, purchaseItem } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  const student = currentUser as Student;
  const categories = ['all', ...Array.from(new Set(storeItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'all'
    ? storeItems
    : storeItems.filter(item => item.category === selectedCategory);

  const handlePurchase = (itemId: string, itemName: string, itemPrice: number) => {
    setPurchaseError(null);
    setPurchaseSuccess(null);

    if (student.balance < itemPrice) {
      setPurchaseError('Insufficient funds');
      return;
    }

    if (purchaseItem(student.id, itemId)) {
      setPurchaseSuccess(itemName);
      setTimeout(() => setPurchaseSuccess(null), 3000);
    } else {
      setPurchaseError('Purchase failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl text-[#1e5f74] mb-1">School Store</h1>
              <p className="text-gray-600">Your Balance: ${student.balance.toFixed(2)}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-[#4fb3c6]" />
          </div>

          {purchaseSuccess && (
            <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Successfully purchased {purchaseSuccess}!</span>
            </div>
          )}

          {purchaseError && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl">
              {purchaseError}
            </div>
          )}

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-[#1e5f74] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const canAfford = student.balance >= item.price;
              return (
                <div key={item.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-lg text-gray-800 mb-1">{item.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl text-[#4fb3c6]">${item.price.toFixed(2)}</p>
                    <button
                      onClick={() => handlePurchase(item.id, item.name, item.price)}
                      disabled={!canAfford || !item.inStock}
                      className={`px-4 py-2 rounded-xl transition-colors ${
                        canAfford && item.inStock
                          ? 'bg-[#1e5f74] text-white hover:bg-[#0d3d4d]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {!item.inStock ? 'Out of Stock' : !canAfford ? 'Not Enough' : 'Buy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
