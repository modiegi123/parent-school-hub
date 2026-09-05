import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { AttendanceHistoryRow, StudentSummary } from '../types';

export default function ParentAttendanceView() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentSummary[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get<StudentSummary[]>('/api/students/my-children', user.token)
      .then((data) => {
        setChildren(data);
        if (data.length > 0) setStudentId(data[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load children.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || studentId === null) return;
    setLoading(true);
    api
      .get<AttendanceHistoryRow[]>(`/api/attendance/student/${studentId}`, user.token)
      .then(setHistory)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load attendance.'))
      .finally(() => setLoading(false));
  }, [user, studentId]);

  if (children.length === 0) {
    return <p className="muted">No children linked to your account yet.</p>;
  }

  return (
    <div>
      <div className="card">
        <div className="field" style={{ maxWidth: 260 }}>
          <label htmlFor="child">Child</label>
          <select id="child" value={studentId ?? ''} onChange={(e) => setStudentId(Number(e.target.value))}>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.classRoomName ? `(${c.classRoomName})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : history.length === 0 ? (
          <p className="muted">No attendance recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.date}>
                  <td>{h.date}</td>
                  <td>
                    <span className={`status-pill status-${h.status}`}>{h.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
