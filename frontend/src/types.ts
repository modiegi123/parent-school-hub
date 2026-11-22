export type UserRole = 'Admin' | 'Teacher' | 'Parent';

export interface AuthUser {
  token: string;
  name: string;
  email: string;
  role: UserRole;
  schoolId: number;
  userId: number;
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  authorName: string;
}

export interface ClassRoom {
  id: number;
  name: string;
  teacherName: string | null;
}

export interface StudentSummary {
  id: number;
  name: string;
  classRoomId: number | null;
  classRoomName: string | null;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface StudentAttendanceRow {
  studentId: number;
  studentName: string;
  status: AttendanceStatus | null;
}

export interface AttendanceHistoryRow {
  date: string;
  status: AttendanceStatus;
}

export interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  classRoomId: number;
  classRoomName: string;
  createdByName: string;
}

export interface StudentGradeRow {
  studentId: number;
  studentName: string;
  score: number | null;
}

export interface GradeHistoryRow {
  subject: string;
  term: string;
  score: number;
}

export type FeeStatus = 'Pending' | 'Paid' | 'Overdue';

export interface Fee {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  studentId: number;
  studentName: string;
}

export interface SchoolEvent {
  id: number;
  title: string;
  location: string | null;
  startsAt: string;
}

export interface ReportCard {
  id: number;
  term: string;
  summary: string | null;
  issuedAt: string;
  studentId: number;
  studentName: string;
}

export interface PerformanceBuckets {
  well: number;
  average: number;
  poor: number;
  noData: number;
}

export interface AttendanceSummary {
  presentCount: number;
  totalCount: number;
  presentRate: number | null;
}

export interface TeacherActivityRow {
  teacherId: number;
  teacherName: string;
  loginCount: number;
  homeworkPosted: number;
  announcementsPosted: number;
}

export interface DashboardOverview {
  month: string;
  performance: PerformanceBuckets;
  attendance: AttendanceSummary;
  teacherActivity: TeacherActivityRow[];
  eventsThisMonth: number;
}
