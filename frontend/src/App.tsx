import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AttendancePage from './pages/AttendancePage';
import HomeworkPage from './pages/HomeworkPage';
import MarksPage from './pages/MarksPage';
import FeesPage from './pages/FeesPage';
import EventsPage from './pages/EventsPage';
import ReportCardsPage from './pages/ReportCardsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/homework" element={<HomeworkPage />} />
        <Route path="/marks" element={<MarksPage />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/report-cards" element={<ReportCardsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/announcements" replace />} />
    </Routes>
  );
}
