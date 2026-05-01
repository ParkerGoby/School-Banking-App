import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Student } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { ArrowLeft, DollarSign, AlertCircle } from 'lucide-react';

export default function WithdrawSpend() {
  const { currentUser, addTransaction } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  const student = currentUser as Student;

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const requestAmount = parseFloat(amount);

    if (isNaN(requestAmount) || requestAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (requestAmount > student.balance) {
      setError('Insufficient funds');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    addTransaction({
      studentId: student.id,
      type: 'withdrawal',
      amount: -requestAmount,
      description: `Withdrawal Request: ${reason}`,
      processedBy: 'Pending Review',
      approved: false,
    });

    setSuccess(true);
    setAmount('');
    setReason('');

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h1 className="text-3xl text-[#1e5f74] mb-2">Make a Request</h1>
          <p className="text-gray-600 mb-6">Request a withdrawal from your account</p>

          <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <p className="text-sm text-gray-700">
              <strong>Available Balance:</strong> ${student.balance.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleRequest} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Amount (Launch Lab Bucks)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4fb3c6] focus:border-transparent bg-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Reason for Withdrawal</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none"
                rows={3}
                placeholder="What do you need this for?"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                Request submitted! The finance team will review it soon.
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1e5f74] text-white py-3 rounded-xl hover:bg-[#0d3d4d] transition-colors"
            >
              Submit Request
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Large withdrawals may require teacher approval. The finance team will process your request during banking hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
