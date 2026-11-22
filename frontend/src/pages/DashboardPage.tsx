import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { api, ApiError } from '../api/client';
import type { DashboardOverview } from '../types';
import { BarChart, DonutChart } from '../components/charts';

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

  const { performance, attendance, userActivity, eventsThisMonth } = data;

  const performanceSegments = [
    { label: 'Well', value: performance.well, color: 'var(--success)', icon: '✓' },
    { label: 'Average', value: performance.average, color: '#a67c00', icon: '~' },
    { label: 'Poor', value: performance.poor, color: 'var(--danger)', icon: '✕' },
  ];
  if (performance.noData > 0) {
    performanceSegments.push({ label: 'No grades yet', value: performance.noData, color: 'var(--border)', icon: '–' });
  }

  const attendanceBars = [
    { label: 'Present', value: attendance.presentCount, color: 'var(--success)', icon: '✓' },
    { label: 'Late', value: attendance.lateCount, color: '#a67c00', icon: '~' },
    { label: 'Absent', value: attendance.absentCount, color: 'var(--danger)', icon: '✕' },
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <p className="muted" style={{ marginBottom: 16 }}>{monthLabel(data.month)}</p>

      <div className="card">
        <h3>Student performance</h3>
        {performance.well + performance.average + performance.poor === 0 ? (
          <p className="muted">No grades recorded yet.</p>
        ) : (
          <DonutChart segments={performanceSegments} />
        )}
      </div>

      <div className="card row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3>Attendance</h3>
          {attendance.totalCount === 0 ? (
            <p className="muted">No attendance recorded this month.</p>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: 12 }}>
                {attendance.presentRate}% present overall ({attendance.totalCount} records)
              </p>
              <BarChart bars={attendanceBars} />
            </>
          )}
        </div>
        <div style={{ minWidth: 140 }}>
          <h3>Events</h3>
          <p>{eventsThisMonth} this month</p>
        </div>
      </div>

      <div className="card">
        <h3>User activity this month</h3>
        <p className="muted" style={{ marginBottom: 12 }}>
          Logins, homework posted, and announcements posted — a quick read on who's actively using the hub,
          teachers and parents alike.
        </p>
        {userActivity.length === 0 ? (
          <p className="muted">No teachers or parents yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Logins</th>
                <th>Homework posted</th>
                <th>Announcements posted</th>
              </tr>
            </thead>
            <tbody>
              {userActivity.map((u) => (
                <tr key={u.userId}>
                  <td>{u.userName}</td>
                  <td>{u.role}</td>
                  <td>{u.loginCount}</td>
                  <td>{u.homeworkPosted}</td>
                  <td>{u.announcementsPosted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
