namespace ParentSchoolHub.Api.Dtos;

public record ReportCardDto(int Id, string Term, string? Summary, DateTime IssuedAt, int StudentId, string StudentName);

public record GenerateReportCardRequest(int StudentId, string Term);
