namespace ParentSchoolHub.Api.Dtos;

public record PerformanceBuckets(int Well, int Average, int Poor, int NoData);

public record AttendanceSummary(int PresentCount, int AbsentCount, int LateCount, int TotalCount, double? PresentRate);

public record UserActivityRow(int UserId, string UserName, string Role, int LoginCount, int HomeworkPosted, int AnnouncementsPosted);

public record DashboardOverviewDto(
    string Month,
    PerformanceBuckets Performance,
    AttendanceSummary Attendance,
    List<UserActivityRow> UserActivity,
    int EventsThisMonth);
