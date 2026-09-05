import { useAuth } from '../auth/AuthContext';
import TeacherAttendanceView from '../components/TeacherAttendanceView';
import ParentAttendanceView from '../components/ParentAttendanceView';

export default function AttendancePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h2>Attendance</h2>
      {user.role === 'Parent' ? <ParentAttendanceView /> : <TeacherAttendanceView />}
    </div>
  );
}
