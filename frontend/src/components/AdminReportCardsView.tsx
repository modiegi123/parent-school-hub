import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { ClassRoom, ReportCard, StudentSummary } from '../types';

const CURRENT_TERM = 'Term 4 2026';

export default function AdminReportCardsView() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [term, setTerm] = useState(CURRENT_TERM);
  const [generated, setGenerated] = useState<ReportCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get<ClassRoom[]>('/api/classes', user.token)
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || classId === null) return;
    api
      .get<StudentSummary[]>(`/api/classes/${classId}/students`, user.token)
      .then((data) => {
        setStudents(data);
        setStudentId(data.length > 0 ? data[0].id : null);
      })
      .catch(() => {});
  }, [user, classId]);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!user || studentId === null) return;
    setGenerating(true);
    setError(null);
    setGenerated(null);
    try {
      const card = await api.post<ReportCard>('/api/reportcards/generate', { studentId, term }, user.token);
      setGenerated(card);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not generate report card.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div>
      <form className="card" onSubmit={handleGenerate}>
        <h3>Generate report card</h3>
        <div className="row">
          <div className="field" style={{ minWidth: 180 }}>
            <label htmlFor="class">Class</label>
            <select id="class" value={classId ?? ''} onChange={(e) => setClassId(Number(e.target.value))}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 180 }}>
            <label htmlFor="student">Student</label>
            <select id="student" value={studentId ?? ''} onChange={(e) => setStudentId(Number(e.target.value))}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field" style={{ minWidth: 160 }}>
            <label htmlFor="term">Term</label>
            <input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={generating || studentId === null}>
          {generating ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {generated && (
        <div className="card">
          <h3>
            {generated.studentName} · {generated.term}
          </h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{generated.summary}</pre>
          <p className="muted">Issued {new Date(generated.issuedAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
