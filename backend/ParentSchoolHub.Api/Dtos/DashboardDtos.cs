namespace ParentSchoolHub.Api.Dtos;

public record PerformanceBuckets(int Well, int Average, int Poor, int NoData);

public record AttendanceSummary(int PresentCount, int TotalCount, double? PresentRate);

public record TeacherActivityRow(int TeacherId, string TeacherName, int LoginCount, int HomeworkPosted, int AnnouncementsPosted);

public record DashboardOverviewDto(
    string Month,
    PerformanceBuckets Performance,
    AttendanceSummary Attendance,
    List<TeacherActivityRow> TeacherActivity,
    int EventsThisMonth);
