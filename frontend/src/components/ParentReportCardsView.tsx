import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { ReportCard, StudentSummary } from '../types';

export default function ParentReportCardsView() {
  const { user } = useAuth();
  const [children, setChildren] = useState<StudentSummary[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
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
      .get<ReportCard[]>(`/api/reportcards/student/${studentId}`, user.token)
      .then(setReportCards)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load report cards.'))
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
      ) : reportCards.length === 0 ? (
        <p className="muted">No report cards issued yet.</p>
      ) : (
        reportCards.map((r) => (
          <div className="card" key={r.id}>
            <h3>{r.term}</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{r.summary}</pre>
            <p className="muted">Issued {new Date(r.issuedAt).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
