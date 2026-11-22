import { NavLink, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="row">
          <strong>Parent-School Hub</strong>
          <nav>
            <NavLink to="/announcements" className={({ isActive }) => (isActive ? 'active' : '')}>
              Announcements
            </NavLink>
            <NavLink to="/attendance" className={({ isActive }) => (isActive ? 'active' : '')}>
              Attendance
            </NavLink>
            <NavLink to="/homework" className={({ isActive }) => (isActive ? 'active' : '')}>
              Homework
            </NavLink>
            <NavLink to="/marks" className={({ isActive }) => (isActive ? 'active' : '')}>
              Marks
            </NavLink>
            {user.role !== 'Teacher' && (
              <NavLink to="/fees" className={({ isActive }) => (isActive ? 'active' : '')}>
                Fees
              </NavLink>
            )}
            <NavLink to="/events" className={({ isActive }) => (isActive ? 'active' : '')}>
              Events
            </NavLink>
            <NavLink to="/report-cards" className={({ isActive }) => (isActive ? 'active' : '')}>
              Report Cards
            </NavLink>
          </nav>
        </div>
        <div className="row">
          <span className="muted">
            {user.name} · {user.role}
          </span>
          <button className="secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
