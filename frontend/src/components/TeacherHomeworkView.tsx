import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { ClassRoom, Homework } from '../types';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TeacherHomeworkView() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [classId, setClassId] = useState<number | null>(null);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

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

  async function load(id: number) {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Homework[]>(`/api/homework/class/${id}`, user.token);
      setHomework(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load homework.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (classId !== null) load(classId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user || classId === null) return;
    setPosting(true);
    setError(null);
    try {
      await api.post('/api/homework', { classRoomId: classId, title, description, dueDate }, user.token);
      setTitle('');
      setDescription('');
      await load(classId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not post homework.');
    } finally {
      setPosting(false);
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
      </div>

      <form className="card" onSubmit={handleCreate}>
        <h3>New homework</h3>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="field" style={{ maxWidth: 200 }}>
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <button type="submit" disabled={posting || classId === null}>
          {posting ? 'Posting…' : 'Post homework'}
        </button>
      </form>

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
