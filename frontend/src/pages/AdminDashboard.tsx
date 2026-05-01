import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { useNavigate } from 'react-router';
import { Users, DollarSign, Calendar, Settings, TrendingUp, LogOut, Check } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, students, transactions, runPayroll, logout } = useAuth();
  const navigate = useNavigate();
  const [payrollSuccess, setPayrollSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  const totalBalance = students.reduce((sum, s) => sum + s.balance, 0);
  const avgBalance = totalBalance / students.length;
  const recentTransactions = transactions.slice(0, 10);
  const pendingTransactions = transactions.filter(t => !t.approved).length;

  const handleRunPayroll = () => {
    runPayroll();
    setPayrollSuccess(true);
    setTimeout(() => setPayrollSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl text-[#1e5f74]">Admin Dashboard</h1>
            <p className="text-gray-600">Manage Launch Lab Bank system</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>

        {payrollSuccess && (
          <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>Payroll processed successfully for all students!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <p className="text-3xl text-gray-800">{students.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Total Balance</p>
            </div>
            <p className="text-3xl text-gray-800">${totalBalance.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Avg Balance</p>
            </div>
            <p className="text-3xl text-gray-800">${avgBalance.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <p className="text-3xl text-gray-800">{pendingTransactions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payroll Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4">Payroll Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Next Payroll Date</p>
                <p className="text-lg text-gray-800">Friday, April 25, 2026</p>
              </div>

              <button
                onClick={handleRunPayroll}
                className="w-full bg-[#1e5f74] text-white py-3 rounded-xl hover:bg-[#0d3d4d] transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Run Payroll Now
              </button>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">Interest Rate Settings</p>
                <p className="text-sm text-gray-800">Monthly: 1%</p>
                <p className="text-xs text-gray-500 mt-1">Next interest: May 1, 2026</p>
              </div>
            </div>
          </div>

          {/* Student Overview */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4">Student Accounts</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-800">{student.name}</p>
                    <p className="text-[#4fb3c6]">${student.balance.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{student.jobTitle}</span>
                    <span>${student.payRate}/hr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl p-6 shadow-lg">
            <h2 className="text-xl text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.map((transaction) => {
                const student = students.find(s => s.id === transaction.studentId);
                return (
                  <div key={transaction.id} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-800">{student?.name}</p>
                      <p className={`text-sm ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">{transaction.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{transaction.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3">
            <Settings className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">Manage Jobs & Pay Rates</span>
          </button>
          <button className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">Adjust Balances</span>
          </button>
          <button className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition-shadow flex items-center gap-3">
            <Users className="h-6 w-6 text-[#4fb3c6]" />
            <span className="text-[#1e5f74]">Export Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
