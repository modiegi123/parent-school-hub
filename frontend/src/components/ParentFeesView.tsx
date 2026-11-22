import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { Fee, StudentSummary } from '../types';

export default function ParentFeesView() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentSummary[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
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
      .get<Fee[]>(`/api/fees/student/${studentId}`, user.token)
      .then(setFees)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load fees.'))
      .finally(() => setLoading(false));
  }, [user, studentId]);

  if (children.length === 0) {
    return <p className="muted">No children linked to your account yet.</p>;
  }

  const outstanding = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);

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
        <p className="muted">Outstanding balance: R{outstanding.toFixed(2)}</p>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : fees.length === 0 ? (
          <p className="muted">No fees recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id}>
                  <td>{f.description}</td>
                  <td>R{f.amount.toFixed(2)}</td>
                  <td>{f.dueDate}</td>
                  <td>
                    <span className={`status-pill status-${f.status}`}>{f.status}</span>
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
