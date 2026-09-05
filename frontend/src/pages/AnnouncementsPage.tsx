import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { Announcement } from '../types';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const canPost = user?.role === 'Admin' || user?.role === 'Teacher';

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<Announcement[]>('/api/announcements', user.token);
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load announcements.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPosting(true);
    setError(null);
    try {
      await api.post('/api/announcements', { title, body }, user.token);
      setTitle('');
      setBody('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not post announcement.');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h2>Announcements</h2>

      {canPost && (
        <form className="card" onSubmit={handleCreate}>
          <h3>New announcement</h3>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="body">Message</label>
            <textarea id="body" rows={3} value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button type="submit" disabled={posting}>
            {posting ? 'Posting…' : 'Post announcement'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : announcements.length === 0 ? (
        <p className="muted">No announcements yet.</p>
      ) : (
        announcements.map((a) => (
          <div className="card" key={a.id}>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            <p className="muted">
              {a.authorName} · {new Date(a.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
