using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParentSchoolHub.Api.Data;
using ParentSchoolHub.Api.Dtos;
using ParentSchoolHub.Api.Models;
using ParentSchoolHub.Api.Services;

namespace ParentSchoolHub.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/reportcards")]
public class ReportCardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportCardsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<ReportCardDto>>> GetForStudent(int studentId)
    {
        var schoolId = User.GetSchoolId();
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId && s.SchoolId == schoolId);
        if (student is null) return NotFound();

        var role = User.FindFirstRole();
        if (role == UserRole.Parent)
        {
            var isLinked = await _db.ParentStudents.AnyAsync(ps => ps.StudentId == studentId && ps.ParentUserId == User.GetUserId());
            if (!isLinked) return Forbid();
        }

        var reportCards = await _db.ReportCards
            .Where(r => r.StudentId == studentId)
            .OrderByDescending(r => r.IssuedAt)
            .Select(r => new ReportCardDto(r.Id, r.Term, r.Summary, r.IssuedAt, r.StudentId, student.Name))
            .ToListAsync();

        return reportCards;
    }

    [HttpPost("generate")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<ReportCardDto>> Generate(GenerateReportCardRequest request)
    {
        var schoolId = User.GetSchoolId();
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == request.StudentId && s.SchoolId == schoolId);
        if (student is null) return NotFound(new { message = "Student not found." });

        var grades = await _db.Grades
            .Where(g => g.StudentId == request.StudentId && g.Term == request.Term)
            .ToListAsync();

        var attendance = await _db.AttendanceRecords
            .Where(a => a.StudentId == request.StudentId)
            .ToListAsync();

        var presentCount = attendance.Count(a => a.Status == AttendanceStatus.Present);
        var totalCount = attendance.Count;
        var attendanceRate = totalCount == 0 ? (double?)null : Math.Round(presentCount * 100.0 / totalCount, 1);

        var summaryLines = new List<string>();
        if (grades.Count == 0)
        {
            summaryLines.Add("No grades recorded for this term yet.");
        }
        else
        {
            foreach (var g in grades.OrderBy(g => g.Subject))
            {
                summaryLines.Add($"{g.Subject}: {g.Score.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
            }
            var average = Math.Round(grades.Average(g => g.Score), 1);
            summaryLines.Add($"Overall average: {average.ToString(System.Globalization.CultureInfo.InvariantCulture)}");
        }

        summaryLines.Add(attendanceRate is null
            ? "Attendance: no records yet."
            : $"Attendance: {attendanceRate}% present ({presentCount}/{totalCount} days)");

        var reportCard = new ReportCard
        {
            StudentId = request.StudentId,
            Term = request.Term,
            Summary = string.Join("\n", summaryLines),
            IssuedAt = DateTime.UtcNow
        };

        _db.ReportCards.Add(reportCard);
        await _db.SaveChangesAsync();

        var dto = new ReportCardDto(reportCard.Id, reportCard.Term, reportCard.Summary, reportCard.IssuedAt, reportCard.StudentId, student.Name);
        return CreatedAtAction(nameof(GetForStudent), new { studentId = reportCard.StudentId }, dto);
    }
}
