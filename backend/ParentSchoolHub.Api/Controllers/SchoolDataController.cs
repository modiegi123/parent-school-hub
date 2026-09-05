using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ParentSchoolHub.Api.Data;
using ParentSchoolHub.Api.Dtos;
using ParentSchoolHub.Api.Services;

namespace ParentSchoolHub.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class SchoolDataController : ControllerBase
{
    private readonly AppDbContext _db;

    public SchoolDataController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("classes")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<ClassRoomDto>>> GetClasses()
    {
        var schoolId = User.GetSchoolId();

        var classes = await _db.Classes
            .Where(c => c.SchoolId == schoolId)
            .OrderBy(c => c.Name)
            .Select(c => new ClassRoomDto(c.Id, c.Name, c.Teacher != null ? c.Teacher.Name : null))
            .ToListAsync();

        return classes;
    }

    [HttpGet("classes/{classRoomId:int}/students")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<List<StudentSummaryDto>>> GetStudentsForClass(int classRoomId)
    {
        var schoolId = User.GetSchoolId();

        var students = await _db.Students
            .Where(s => s.ClassRoomId == classRoomId && s.SchoolId == schoolId)
            .OrderBy(s => s.Name)
            .Select(s => new StudentSummaryDto(s.Id, s.Name, s.ClassRoomId, s.ClassRoom!.Name))
            .ToListAsync();

        return students;
    }

    [HttpGet("students/my-children")]
    [Authorize(Roles = "Parent")]
    public async Task<ActionResult<List<StudentSummaryDto>>> GetMyChildren()
    {
        var userId = User.GetUserId();

        var children = await _db.ParentStudents
            .Where(ps => ps.ParentUserId == userId)
            .Select(ps => new StudentSummaryDto(
                ps.Student!.Id,
                ps.Student.Name,
                ps.Student.ClassRoomId,
                ps.Student.ClassRoom != null ? ps.Student.ClassRoom.Name : null))
            .ToListAsync();

        return children;
    }
}
