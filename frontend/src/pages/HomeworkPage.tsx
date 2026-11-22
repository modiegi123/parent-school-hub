import { useAuth } from '../auth/AuthContext';
import TeacherHomeworkView from '../components/TeacherHomeworkView';
import ParentHomeworkView from '../components/ParentHomeworkView';

export default function HomeworkPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2>Homework</h2>
      {user.role === 'Parent' ? <ParentHomeworkView /> : <TeacherHomeworkView />}
    </div>
  );
}
