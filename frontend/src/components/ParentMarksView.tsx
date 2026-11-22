import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { GradeHistoryRow, StudentSummary } from '../types';

export default function ParentMarksView() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentSummary[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [grades, setGrades] = useState<GradeHistoryRow[]>([]);
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
      .get<GradeHistoryRow[]>(`/api/grades/student/${studentId}`, user.token)
      .then(setGrades)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load grades.'))
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
        ) : grades.length === 0 ? (
          <p className="muted">No grades recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Term</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={`${g.subject}-${g.term}`}>
                  <td>{g.subject}</td>
                  <td>{g.term}</td>
                  <td>{g.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
