import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { AttendanceStatus, ClassRoom, StudentAttendanceRow } from '../types';

const STATUSES: AttendanceStatus[] = ['Present', 'Absent', 'Late'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherAttendanceView() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<StudentAttendanceRow[]>([]);
  const [pending, setPending] = useState<Record<number, AttendanceStatus>>({});
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

  useEffect(() => {
    if (!user || classId === null) return;
    setLoading(true);
    setSaved(false);
    api
      .get<StudentAttendanceRow[]>(`/api/attendance/class/${classId}?date=${date}`, user.token)
      .then((data) => {
        setRows(data);
        setPending({});
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load attendance.'))
      .finally(() => setLoading(false));
  }, [user, classId, date]);

  function setStatus(studentId: number, status: AttendanceStatus) {
    setPending((p) => ({ ...p, [studentId]: status }));
  }

  async function handleSave() {
    if (!user || classId === null) return;
    setSaving(true);
    setError(null);
    try {
      const entries = rows
        .map((r) => ({ studentId: r.studentId, status: pending[r.studentId] ?? r.status }))
        .filter((e): e is { studentId: number; status: AttendanceStatus } => e.status !== null);

      await api.post('/api/attendance', { classRoomId: classId, date, entries }, user.token);
      setSaved(true);
      const refreshed = await api.get<StudentAttendanceRow[]>(
        `/api/attendance/class/${classId}?date=${date}`,
        user.token,
      );
      setRows(refreshed);
      setPending({});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save attendance.');
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
        <div className="field" style={{ minWidth: 160 }}>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const current = pending[r.studentId] ?? r.status ?? 'Present';
                return (
                  <tr key={r.studentId}>
                    <td>{r.studentName}</td>
                    <td>
                      <select value={current} onChange={(e) => setStatus(r.studentId, e.target.value as AttendanceStatus)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave} disabled={saving || rows.length === 0}>
            {saving ? 'Saving…' : 'Save attendance'}
          </button>
          {saved && <span className="muted" style={{ marginLeft: 12 }}>Saved.</span>}
        </div>
      </div>
    </div>
  );
}
