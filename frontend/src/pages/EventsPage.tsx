import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { SchoolEvent } from '../types';

function nowLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [startsAt, setStartsAt] = useState(nowLocal());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const canCreate = user?.role === 'Admin';

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<SchoolEvent[]>('/api/events', user.token);
      setEvents(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load events.');
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
      await api.post('/api/events', { title, location: location || null, startsAt: new Date(startsAt).toISOString() }, user.token);
      setTitle('');
      setLocation('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create event.');
    } finally {
      setPosting(false);
    }
  }

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startsAt) >= now);
  const past = events.filter((e) => new Date(e.startsAt) < now);

  return (
    <div>
      <h2>Events</h2>

      {canCreate && (
        <form className="card" onSubmit={handleCreate}>
          <h3>New event</h3>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="row">
            <div className="field" style={{ minWidth: 200 }}>
              <label htmlFor="location">Location</label>
              <input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="field" style={{ minWidth: 220 }}>
              <label htmlFor="startsAt">Starts at</label>
              <input
                id="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" disabled={posting}>
            {posting ? 'Creating…' : 'Create event'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Loading…</p>
      ) : events.length === 0 ? (
        <p className="muted">No events scheduled yet.</p>
      ) : (
        <>
          <h3>Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="muted">No upcoming events.</p>
          ) : (
            upcoming.map((e) => (
              <div className="card" key={e.id}>
                <h3>{e.title}</h3>
                <p className="muted">
                  {new Date(e.startsAt).toLocaleString()} {e.location ? `· ${e.location}` : ''}
                </p>
              </div>
            ))
          )}

          {past.length > 0 && (
            <>
              <h3>Past</h3>
              {past.map((e) => (
                <div className="card" key={e.id}>
                  <h3>{e.title}</h3>
                  <p className="muted">
                    {new Date(e.startsAt).toLocaleString()} {e.location ? `· ${e.location}` : ''}
                  </p>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
