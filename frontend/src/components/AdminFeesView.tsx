import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { ClassRoom, Fee, FeeStatus, StudentSummary } from '../types';

const STATUSES: FeeStatus[] = ['Pending', 'Paid', 'Overdue'];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminFeesView() {
  const { user } = useAuth();
  const [fees, setFees] = useState<Fee[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Fee[]>('/api/fees/school', user.token);
      setFees(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load fees.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user || studentId === null) return;
    setPosting(true);
    setError(null);
    try {
      await api.post(
        '/api/fees',
        { studentId, description, amount: Number(amount), dueDate },
        user.token,
      );
      setDescription('');
      setAmount('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create fee.');
    } finally {
      setPosting(false);
    }
  }

  async function handleStatusChange(feeId: number, status: FeeStatus) {
    if (!user) return;
    try {
      await api.put(`/api/fees/${feeId}/status`, { status }, user.token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not update fee status.');
    }
  }

  const outstanding = fees.filter((f) => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <form className="card" onSubmit={handleCreate}>
        <h3>New fee</h3>
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
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="row">
          <div className="field" style={{ maxWidth: 160 }}>
            <label htmlFor="amount">Amount (ZAR)</label>
            <input
              id="amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label htmlFor="dueDate">Due date</label>
            <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </div>
        <button type="submit" disabled={posting || studentId === null}>
          {posting ? 'Creating…' : 'Create fee'}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="card">
        <p className="muted">Outstanding across school: R{outstanding.toFixed(2)}</p>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : fees.length === 0 ? (
          <p className="muted">No fees recorded yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id}>
                  <td>{f.studentName}</td>
                  <td>{f.description}</td>
                  <td>R{f.amount.toFixed(2)}</td>
                  <td>{f.dueDate}</td>
                  <td>
                    <select value={f.status} onChange={(e) => handleStatusChange(f.id, e.target.value as FeeStatus)}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
