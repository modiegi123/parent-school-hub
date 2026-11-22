namespace ParentSchoolHub.Api.Dtos;

public record GradeEntry(int StudentId, decimal Score);

public record MarkGradesRequest(int ClassRoomId, string Subject, string Term, List<GradeEntry> Entries);

public record StudentGradeRow(int StudentId, string StudentName, decimal? Score);

public record GradeHistoryRow(string Subject, string Term, decimal Score);
