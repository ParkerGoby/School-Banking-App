import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useNavigate } from 'react-router';
import { Search, DollarSign, LogOut, Printer } from 'lucide-react';

export default function FinanceDashboard() {
  const { currentUser, students, addTransaction, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'finance') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'finance') {
    return null;
  }

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) return;

    const finalAmount = transactionType === 'withdrawal' ? -transactionAmount : transactionAmount;

    addTransaction({
      studentId: selectedStudent,
      type: transactionType,
      amount: finalAmount,
      description: description || `${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} by Finance Team`,
      processedBy: currentUser.name,
      approved: true,
    });

    setAmount('');
    setDescription('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl text-[#1e5f74]">Finance Team Dashboard</h1>
            <p className="text-gray-600">Process deposits and withdrawals</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Student Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4">Search Student</h2>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4fb3c6] focus:border-transparent bg-white"
                placeholder="Search by name or username..."
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student.id)}
                  className={`w-full p-4 rounded-xl text-left transition-all ${
                    selectedStudent === student.id
                      ? 'bg-teal-100 border-2 border-[#4fb3c6]'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <p className="text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">@{student.username}</p>
                  <p className="text-sm text-[#4fb3c6] mt-1">Balance: ${student.balance.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction Panel */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4">Process Transaction</h2>

            {selectedStudentData ? (
              <>
                <div className="bg-teal-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-600">Selected Student</p>
                  <p className="text-lg text-gray-800">{selectedStudentData.name}</p>
                  <p className="text-sm text-gray-500">{selectedStudentData.jobTitle}</p>
                  <p className="text-xl text-[#1e5f74] mt-2">
                    Current Balance: ${selectedStudentData.balance.toFixed(2)}
                  </p>
                </div>

                <form onSubmit={handleTransaction} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Transaction Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTransactionType('deposit')}
                        className={`py-3 rounded-xl transition-colors ${
                          transactionType === 'deposit'
                            ? 'bg-[#4fb3c6] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransactionType('withdrawal')}
                        className={`py-3 rounded-xl transition-colors ${
                          transactionType === 'withdrawal'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Withdrawal
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Amount</label>
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
                    <label className="block text-gray-700 mb-2">Description (optional)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      placeholder="Transaction notes..."
                    />
                  </div>

                  {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-xl">
                      Transaction processed successfully!
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#1e5f74] text-white py-3 rounded-xl hover:bg-[#0d3d4d] transition-colors"
                    >
                      Process Transaction
                    </button>
                    <button
                      type="button"
                      onClick={handlePrintReceipt}
                      className="px-4 py-3 border border-[#1e5f74] text-[#1e5f74] rounded-xl hover:bg-teal-50 transition-colors"
                    >
                      <Printer className="h-5 w-5" />
                    </button>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-yellow-50 rounded-xl">
                  <p className="text-xs text-gray-600">
                    Note: Large withdrawals require teacher approval
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a student to process transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
