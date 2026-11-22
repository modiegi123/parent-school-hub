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
[Route("api/homework")]
public class HomeworkController : ControllerBase
{
    private readonly AppDbContext _db;

    public HomeworkController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("class/{classRoomId:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<HomeworkDto>>> GetForClass(int classRoomId)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == classRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound();

        var homework = await _db.Homeworks
            .Where(h => h.ClassRoomId == classRoomId)
            .OrderByDescending(h => h.DueDate)
            .Select(h => new HomeworkDto(h.Id, h.Title, h.Description, h.DueDate, h.ClassRoomId, h.ClassRoom!.Name, h.CreatedBy!.Name))
            .ToListAsync();

        return homework;
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<HomeworkDto>>> GetForStudent(int studentId)
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

        if (student.ClassRoomId is null) return new List<HomeworkDto>();

        var homework = await _db.Homeworks
            .Where(h => h.ClassRoomId == student.ClassRoomId)
            .OrderByDescending(h => h.DueDate)
            .Select(h => new HomeworkDto(h.Id, h.Title, h.Description, h.DueDate, h.ClassRoomId, h.ClassRoom!.Name, h.CreatedBy!.Name))
            .ToListAsync();

        return homework;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<HomeworkDto>> Create(CreateHomeworkRequest request)
    {
        var schoolId = User.GetSchoolId();
        var classRoom = await _db.Classes.FirstOrDefaultAsync(c => c.Id == request.ClassRoomId && c.SchoolId == schoolId);
        if (classRoom is null) return NotFound(new { message = "Class not found." });

        var homework = new Homework
        {
            ClassRoomId = request.ClassRoomId,
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            CreatedByUserId = User.GetUserId()
        };

        _db.Homeworks.Add(homework);
        await _db.SaveChangesAsync();

        var createdBy = await _db.Users.FindAsync(homework.CreatedByUserId);
        var dto = new HomeworkDto(homework.Id, homework.Title, homework.Description, homework.DueDate, homework.ClassRoomId, classRoom.Name, createdBy!.Name);
        return CreatedAtAction(nameof(GetForClass), new { classRoomId = homework.ClassRoomId }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Update(int id, UpdateHomeworkRequest request)
    {
        var schoolId = User.GetSchoolId();
        var homework = await _db.Homeworks
            .Include(h => h.ClassRoom)
            .FirstOrDefaultAsync(h => h.Id == id && h.ClassRoom!.SchoolId == schoolId);
        if (homework is null) return NotFound();

        homework.Title = request.Title;
        homework.Description = request.Description;
        homework.DueDate = request.DueDate;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var schoolId = User.GetSchoolId();
        var homework = await _db.Homeworks
            .Include(h => h.ClassRoom)
            .FirstOrDefaultAsync(h => h.Id == id && h.ClassRoom!.SchoolId == schoolId);
        if (homework is null) return NotFound();

        _db.Homeworks.Remove(homework);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
