import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { ClassRoom, StudentGradeRow } from '../types';

const CURRENT_TERM = 'Term 4 2026';
const SUBJECTS = ['Mathematics', 'English', 'Science', 'Social Studies'];

export default function TeacherMarksView() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [term, setTerm] = useState(CURRENT_TERM);
  const [rows, setRows] = useState<StudentGradeRow[]>([]);
  const [pending, setPending] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    api
      .get<ClassRoom[]>('/api/classes', user.token)
      .then((data) => {
        setClasses(data);
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load classes.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function load() {
    if (!user || classId === null) return;
    setLoading(true);
    setSaved(false);
    try {
      const data = await api.get<StudentGradeRow[]>(
        `/api/grades/class/${classId}?subject=${encodeURIComponent(subject)}&term=${encodeURIComponent(term)}`,
        user.token,
      );
      setRows(data);
      setPending({});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load grades.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, subject, term]);

  function setScore(studentId: number, value: string) {
    setPending((p) => ({ ...p, [studentId]: value }));
  }

  async function handleSave() {
    if (!user || classId === null) return;
    setSaving(true);
    setError(null);
    try {
      const entries = rows
        .map((r) => {
          const raw = pending[r.studentId] ?? (r.score !== null ? String(r.score) : '');
          const score = Number(raw);
          return raw !== '' && !Number.isNaN(score) ? { studentId: r.studentId, score } : null;
        })
        .filter((e): e is { studentId: number; score: number } => e !== null);

      await api.post('/api/grades', { classRoomId: classId, subject, term, entries }, user.token);
      setSaved(true);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save grades.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="card row">
        <div className="field" style={{ minWidth: 200 }}>
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
          <label htmlFor="subject">Subject</label>
          <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: 160 }}>
          <label htmlFor="term">Term</label>
          <input id="term" value={term} onChange={(e) => setTerm(e.target.value)} />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const current = pending[r.studentId] ?? (r.score !== null ? String(r.score) : '');
                return (
                  <tr key={r.studentId}>
                    <td>{r.studentName}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={current}
                        onChange={(e) => setScore(r.studentId, e.target.value)}
                        style={{ maxWidth: 100 }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave} disabled={saving || rows.length === 0}>
            {saving ? 'Saving…' : 'Save grades'}
          </button>
          {saved && <span className="muted" style={{ marginLeft: 12 }}>Saved.</span>}
        </div>
      </div>
    </div>
  );
}
