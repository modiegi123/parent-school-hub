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
[Route("api/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly AppDbContext _db;

    public AttendanceController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("class/{classRoomId:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<StudentAttendanceRow>>> GetForClass(int classRoomId, [FromQuery] DateOnly date)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == classRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound();

        var students = await _db.Students
            .Where(s => s.ClassRoomId == classRoomId)
            .OrderBy(s => s.Name)
            .ToListAsync();

        var records = await _db.AttendanceRecords
            .Where(a => a.ClassRoomId == classRoomId && a.Date == date)
            .ToDictionaryAsync(a => a.StudentId, a => a.Status);

        var rows = students
            .Select(s => new StudentAttendanceRow(s.Id, s.Name, records.TryGetValue(s.Id, out var status) ? status.ToString() : null))
            .ToList();

        return rows;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Mark(MarkAttendanceRequest request)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound(new { message = "Class not found." });

        var markedByUserId = User.GetUserId();

        foreach (var entry in request.Entries)
        {
            if (!Enum.TryParse<AttendanceStatus>(entry.Status, ignoreCase: true, out var status))
            {
                return BadRequest(new { message = $"Invalid attendance status '{entry.Status}'." });
            }

            var existing = await _db.AttendanceRecords
                .FirstOrDefaultAsync(a => a.StudentId == entry.StudentId && a.Date == request.Date);

            if (existing is null)
            {
                _db.AttendanceRecords.Add(new AttendanceRecord
                {
                    StudentId = entry.StudentId,
                    ClassRoomId = request.ClassRoomId,
                    Date = request.Date,
                    Status = status,
                    MarkedByUserId = markedByUserId
                });
            }
            else
            {
                existing.Status = status;
                existing.MarkedByUserId = markedByUserId;
            }
        }

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<AttendanceHistoryRow>>> GetForStudent(int studentId)
    {
        var schoolId = User.GetSchoolId();
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == studentId && s.SchoolId == schoolId);
        if (student is null) return NotFound();

        var role = User.FindFirstRole();
        if (role == UserRole.Parent)
        {
            var isLinked = await _db.ParentStudents
                .AnyAsync(ps => ps.StudentId == studentId && ps.ParentUserId == User.GetUserId());
            if (!isLinked) return Forbid();
        }

        var history = await _db.AttendanceRecords
            .Where(a => a.StudentId == studentId)
            .OrderByDescending(a => a.Date)
            .Select(a => new AttendanceHistoryRow(a.Date, a.Status.ToString()))
            .ToListAsync();

        return history;
    }
}
