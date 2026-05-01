import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/use-auth';

export default function DashboardRouter() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    switch (currentUser.role) {
      case 'student':
        navigate('/student');
        break;
      case 'finance':
        navigate('/finance');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}
