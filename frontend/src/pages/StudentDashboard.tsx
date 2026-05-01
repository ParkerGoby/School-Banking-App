import { useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Student } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Wallet, TrendingUp, Clock, ShoppingBag, FileText, LogOut } from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser, getStudentTransactions, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'student') {
    return null;
  }

  const student = currentUser as Student;
  const transactions = getStudentTransactions(student.id).slice(0, 5);
  const lastPaycheck = transactions.find(t => t.type === 'payroll');
  const progressPercentage = (student.balance / student.savingsGoal) * 100;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl text-[#1e5f74]">Welcome, {student.name}!</h1>
            <p className="text-gray-600">{student.jobTitle}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-r from-[#1e5f74] to-[#4fb3c6] rounded-3xl p-8 text-white mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-6 w-6" />
            <p className="text-cyan-100">Current Balance</p>
          </div>
          <p className="text-5xl mb-4">${student.balance.toFixed(2)}</p>
          <div className="flex items-center gap-2 text-cyan-100">
            <TrendingUp className="h-4 w-4" />
            <p className="text-sm">Pay Rate: ${student.payRate}/hour</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Last Paycheck */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Paycheck</p>
                <p className="text-2xl text-gray-800">
                  {lastPaycheck ? `$${lastPaycheck.amount.toFixed(2)}` : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          {/* Savings Goal */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Savings Goal Progress</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl text-gray-800">${student.balance.toFixed(2)}</p>
                <p className="text-sm text-gray-500">of ${student.savingsGoal.toFixed(2)}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-6 shadow mb-6">
          <h2 className="text-xl text-gray-800 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'payroll' && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {transaction.type === 'deposit' && <Wallet className="h-5 w-5 text-green-600" />}
                      {transaction.type === 'withdrawal' && <FileText className="h-5 w-5 text-red-600" />}
                      {transaction.type === 'purchase' && <ShoppingBag className="h-5 w-5 text-red-600" />}
                      {transaction.type === 'interest' && <TrendingUp className="h-5 w-5 text-green-600" />}
                    </div>
                    <div>
                      <p className="text-gray-800">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <p className={`text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/transactions')}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <FileText className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">View All Transactions</span>
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <Wallet className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">Make a Request</span>
          </button>
          <button
            onClick={() => navigate('/store')}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <ShoppingBag className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">School Store</span>
          </button>
        </div>
      </div>
    </div>
  );
}
