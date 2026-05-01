import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Student } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { ArrowLeft, Filter } from 'lucide-react';

export default function TransactionHistory() {
  const { currentUser, getStudentTransactions } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  const student = currentUser as Student;
  const allTransactions = getStudentTransactions(student.id);
  const filteredTransactions = filter === 'all'
    ? allTransactions
    : allTransactions.filter(t => t.type === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/student')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl text-[#1e5f74]">Transaction History</h1>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-xl px-4 py-2 bg-white focus:ring-2 focus:ring-[#4fb3c6] focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="payroll">Payroll</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="purchase">Purchases</option>
                <option value="interest">Interest</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No transactions found</p>
            ) : (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        transaction.type === 'payroll' ? 'bg-blue-100 text-blue-700' :
                        transaction.type === 'deposit' ? 'bg-green-100 text-green-700' :
                        transaction.type === 'withdrawal' ? 'bg-orange-100 text-orange-700' :
                        transaction.type === 'purchase' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                      <p className="text-gray-800">{transaction.description}</p>
                    </div>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredTransactions.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Transactions:</span>
                <span>{filteredTransactions.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
