import { useAuth } from '../auth/AuthContext';
import TeacherMarksView from '../components/TeacherMarksView';
import ParentMarksView from '../components/ParentMarksView';

export default function MarksPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2>Marks</h2>
      {user.role === 'Parent' ? <ParentMarksView /> : <TeacherMarksView />}
    </div>
  );
}
