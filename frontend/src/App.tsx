import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AttendancePage from './pages/AttendancePage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/announcements" replace />} />
    </Routes>
  );
}
