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
