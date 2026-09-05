namespace ParentSchoolHub.Api.Dtos;

public record AttendanceEntry(int StudentId, string Status);

public record MarkAttendanceRequest(int ClassRoomId, DateOnly Date, List<AttendanceEntry> Entries);

public record StudentAttendanceRow(int StudentId, string StudentName, string? Status);

public record AttendanceHistoryRow(DateOnly Date, string Status);
