using System.Globalization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParentSchoolHub.Api.Data;
using ParentSchoolHub.Api.Dtos;
using ParentSchoolHub.Api.Models;
using ParentSchoolHub.Api.Services;

namespace ParentSchoolHub.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    // Month is "yyyy-MM"; defaults to the current month.
    [HttpGet("overview")]
    public async Task<ActionResult<DashboardOverviewDto>> GetOverview([FromQuery] string? month)
    {
        var schoolId = User.GetSchoolId();

        DateTime monthStart;
        if (!string.IsNullOrEmpty(month) &&
            DateTime.TryParseExact(month, "yyyy-MM", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
        {
            monthStart = new DateTime(parsed.Year, parsed.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        }
        else
        {
            var now = DateTime.UtcNow;
            monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        }
        var monthEnd = monthStart.AddMonths(1);
        var monthLabel = monthStart.ToString("yyyy-MM", CultureInfo.InvariantCulture);

        var studentIds = await _db.Students.Where(s => s.SchoolId == schoolId).Select(s => s.Id).ToListAsync();

        var studentAverages = await _db.Grades
            .Where(g => studentIds.Contains(g.StudentId))
            .GroupBy(g => g.StudentId)
            .Select(g => g.Average(x => x.Score))
            .ToListAsync();

        var well = studentAverages.Count(a => a >= 75);
        var average = studentAverages.Count(a => a >= 50 && a < 75);
        var poor = studentAverages.Count(a => a < 50);
        var noData = studentIds.Count - studentAverages.Count;

        var monthStartDate = DateOnly.FromDateTime(monthStart);
        var monthEndDate = DateOnly.FromDateTime(monthEnd);
        var attendanceRecords = await _db.AttendanceRecords
            .Where(a => studentIds.Contains(a.StudentId) && a.Date >= monthStartDate && a.Date < monthEndDate)
            .ToListAsync();

        var presentCount = attendanceRecords.Count(a => a.Status == AttendanceStatus.Present);
        var totalAttendance = attendanceRecords.Count;
        double? presentRate = totalAttendance == 0 ? null : Math.Round(presentCount * 100.0 / totalAttendance, 1);

        var teachers = await _db.Users
            .Where(u => u.SchoolId == schoolId && u.Role == UserRole.Teacher)
            .OrderBy(u => u.Name)
            .ToListAsync();
        var teacherIds = teachers.Select(t => t.Id).ToList();

        var loginCounts = await _db.LoginActivities
            .Where(l => teacherIds.Contains(l.UserId) && l.OccurredAt >= monthStart && l.OccurredAt < monthEnd)
            .GroupBy(l => l.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var homeworkCounts = await _db.Homeworks
            .Where(h => teacherIds.Contains(h.CreatedByUserId) && h.CreatedAt >= monthStart && h.CreatedAt < monthEnd)
            .GroupBy(h => h.CreatedByUserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var announcementCounts = await _db.Announcements
            .Where(a => teacherIds.Contains(a.AuthorUserId) && a.CreatedAt >= monthStart && a.CreatedAt < monthEnd)
            .GroupBy(a => a.AuthorUserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var teacherActivity = teachers
            .Select(t => new TeacherActivityRow(
                t.Id,
                t.Name,
                loginCounts.TryGetValue(t.Id, out var lc) ? lc : 0,
                homeworkCounts.TryGetValue(t.Id, out var hc) ? hc : 0,
                announcementCounts.TryGetValue(t.Id, out var ac) ? ac : 0))
            .ToList();

        var eventsThisMonth = await _db.SchoolEvents
            .CountAsync(e => e.SchoolId == schoolId && e.StartsAt >= monthStart && e.StartsAt < monthEnd);

        return new DashboardOverviewDto(
            monthLabel,
            new PerformanceBuckets(well, average, poor, noData),
            new AttendanceSummary(presentCount, totalAttendance, presentRate),
            teacherActivity,
            eventsThisMonth);
    }
}
