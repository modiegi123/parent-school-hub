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
[Route("api/grades")]
public class GradesController : ControllerBase
{
    private readonly AppDbContext _db;

    public GradesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("class/{classRoomId:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<StudentGradeRow>>> GetForClass(int classRoomId, [FromQuery] string subject, [FromQuery] string term)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == classRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound();

        var students = await _db.Students
            .Where(s => s.ClassRoomId == classRoomId)
            .OrderBy(s => s.Name)
            .ToListAsync();

        var studentIds = students.Select(s => s.Id).ToList();
        var grades = await _db.Grades
            .Where(g => g.Subject == subject && g.Term == term && studentIds.Contains(g.StudentId))
            .ToDictionaryAsync(g => g.StudentId, g => g.Score);

        var rows = students
            .Select(s => new StudentGradeRow(s.Id, s.Name, grades.TryGetValue(s.Id, out var score) ? score : null))
            .ToList();

        return rows;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Mark(MarkGradesRequest request)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound(new { message = "Class not found." });

        foreach (var entry in request.Entries)
        {
            var existing = await _db.Grades.FirstOrDefaultAsync(g =>
                g.StudentId == entry.StudentId && g.Subject == request.Subject && g.Term == request.Term);

            if (existing is null)
            {
                _db.Grades.Add(new Grade
                {
                    StudentId = entry.StudentId,
                    Subject = request.Subject,
                    Term = request.Term,
                    Score = entry.Score
                });
            }
            else
            {
                existing.Score = entry.Score;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<GradeHistoryRow>>> GetForStudent(int studentId)
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

        var grades = await _db.Grades
            .Where(g => g.StudentId == studentId)
            .OrderByDescending(g => g.Term)
            .ThenBy(g => g.Subject)
            .Select(g => new GradeHistoryRow(g.Subject, g.Term, g.Score))
            .ToListAsync();

        return grades;
    }
}
