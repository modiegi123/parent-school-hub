import { useAuth } from '../auth/AuthContext';
import AdminReportCardsView from '../components/AdminReportCardsView';
import ParentReportCardsView from '../components/ParentReportCardsView';

export default function ReportCardsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2>Report Cards</h2>
      {user.role === 'Parent' ? <ParentReportCardsView /> : <AdminReportCardsView />}
    </div>
  );
}
