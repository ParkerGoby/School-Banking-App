import { createBrowserRouter } from 'react-router';
import Root from './pages/Root';
import Login from './pages/Login';
import DashboardRouter from './pages/DashboardRouter';
import StudentDashboard from './pages/StudentDashboard';
import TransactionHistory from './pages/TransactionHistory';
import WithdrawSpend from './pages/WithdrawSpend';
import SchoolStore from './pages/SchoolStore';
import FinanceDashboard from './pages/FinanceDashboard';
import AdminDashboard from './pages/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: 'dashboard', Component: DashboardRouter },
      { path: 'student', Component: StudentDashboard },
      { path: 'transactions', Component: TransactionHistory },
      { path: 'withdraw', Component: WithdrawSpend },
      { path: 'store', Component: SchoolStore },
      { path: 'finance', Component: FinanceDashboard },
      { path: 'admin', Component: AdminDashboard },
    ],
  },
]);
