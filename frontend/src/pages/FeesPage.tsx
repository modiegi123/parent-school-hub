import { useAuth } from '../auth/AuthContext';
import AdminFeesView from '../components/AdminFeesView';
import ParentFeesView from '../components/ParentFeesView';

export default function FeesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2>Fees</h2>
      {user.role === 'Admin' ? <AdminFeesView /> : <ParentFeesView />}
    </div>
  );
}
