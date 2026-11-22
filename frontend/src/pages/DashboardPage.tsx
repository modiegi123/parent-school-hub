import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { DashboardOverview } from '../types';

function monthLabel(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api
      .get<DashboardOverview>('/api/dashboard/overview', user.token)
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the dashboard.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return null;

  const { performance, attendance, teacherActivity, eventsThisMonth } = data;
  const gradedTotal = performance.well + performance.average + performance.poor;
  const pct = (n: number) => (gradedTotal === 0 ? 0 : Math.round((n / gradedTotal) * 100));

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="muted" style={{ marginBottom: 16 }}>{monthLabel(data.month)}</p>

      <div className="card">
        <h3>Student performance</h3>
        {gradedTotal === 0 ? (
          <p className="muted">No grades recorded yet.</p>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                height: 24,
                borderRadius: 6,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              {performance.well > 0 && (
                <div style={{ width: `${pct(performance.well)}%`, background: 'var(--success)' }} />
              )}
              {performance.average > 0 && (
                <div style={{ width: `${pct(performance.average)}%`, background: '#a67c00' }} />
              )}
              {performance.poor > 0 && (
                <div style={{ width: `${pct(performance.poor)}%`, background: 'var(--danger)' }} />
              )}
            </div>
            <div className="row">
              <span className="status-pill status-Paid">Well: {performance.well}</span>
              <span className="status-pill status-Pending">Average: {performance.average}</span>
              <span className="status-pill status-Overdue">Poor: {performance.poor}</span>
              {performance.noData > 0 && <span className="muted">No grades yet: {performance.noData}</span>}
            </div>
          </>
        )}
      </div>

      <div className="card row">
        <div style={{ minWidth: 180 }}>
          <h3>Attendance</h3>
          {attendance.totalCount === 0 ? (
            <p className="muted">No attendance recorded this month.</p>
          ) : (
            <p>
              {attendance.presentRate}% present
              <br />
              <span className="muted">
                {attendance.presentCount} / {attendance.totalCount} records
              </span>
            </p>
          )}
        </div>
        <div style={{ minWidth: 180 }}>
          <h3>Events</h3>
          <p>{eventsThisMonth} this month</p>
        </div>
      </div>

      <div className="card">
        <h3>Teacher activity this month</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          Logins, homework posted, and announcements posted — a quick read on who's actively using the hub.
        </p>
        {teacherActivity.length === 0 ? (
          <p className="muted">No teachers yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Logins</th>
                <th>Homework posted</th>
                <th>Announcements posted</th>
              </tr>
            </thead>
            <tbody>
              {teacherActivity.map((t) => (
                <tr key={t.teacherId}>
                  <td>{t.teacherName}</td>
                  <td>{t.loginCount}</td>
                  <td>{t.homeworkPosted}</td>
                  <td>{t.announcementsPosted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
