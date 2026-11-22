import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { Homework, StudentSummary } from '../types';

export default function ParentHomeworkView() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentSummary[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
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
      .get<Homework[]>(`/api/homework/student/${studentId}`, user.token)
      .then(setHomework)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load homework.'))
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

      {loading ? (
        <p className="muted">Loading…</p>
      ) : homework.length === 0 ? (
        <p className="muted">No homework posted yet.</p>
      ) : (
        homework.map((h) => (
          <div className="card" key={h.id}>
            <h3>{h.title}</h3>
            <p>{h.description}</p>
            <p className="muted">
              Due {h.dueDate} · {h.createdByName}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
