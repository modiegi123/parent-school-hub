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
[Route("api/fees")]
public class FeesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FeesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("school")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<FeeDto>>> GetForSchool([FromQuery] string? status)
    {
        var schoolId = User.GetSchoolId();
        var query = _db.Fees.Where(f => f.Student!.SchoolId == schoolId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<FeeStatus>(status, true, out var parsed))
        {
            query = query.Where(f => f.Status == parsed);
        }

        var fees = await query
            .OrderBy(f => f.DueDate)
            .Select(f => new FeeDto(f.Id, f.Description, f.Amount, f.DueDate, f.Status.ToString(), f.StudentId, f.Student!.Name))
            .ToListAsync();

        return fees;
    }

    [HttpGet("student/{studentId:int}")]
    public async Task<ActionResult<List<FeeDto>>> GetForStudent(int studentId)
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

        var fees = await _db.Fees
            .Where(f => f.StudentId == studentId)
            .OrderBy(f => f.DueDate)
            .Select(f => new FeeDto(f.Id, f.Description, f.Amount, f.DueDate, f.Status.ToString(), f.StudentId, student.Name))
            .ToListAsync();

        return fees;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FeeDto>> Create(CreateFeeRequest request)
    {
        var schoolId = User.GetSchoolId();
        var student = await _db.Students.FirstOrDefaultAsync(s => s.Id == request.StudentId && s.SchoolId == schoolId);
        if (student is null) return NotFound(new { message = "Student not found." });

        var fee = new Fee
        {
            StudentId = request.StudentId,
            Description = request.Description,
            Amount = request.Amount,
            DueDate = request.DueDate,
            Status = FeeStatus.Pending
        };

        _db.Fees.Add(fee);
        await _db.SaveChangesAsync();

        var dto = new FeeDto(fee.Id, fee.Description, fee.Amount, fee.DueDate, fee.Status.ToString(), fee.StudentId, student.Name);
        return CreatedAtAction(nameof(GetForStudent), new { studentId = fee.StudentId }, dto);
    }

    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateFeeStatusRequest request)
    {
        var schoolId = User.GetSchoolId();
        var fee = await _db.Fees.Include(f => f.Student).FirstOrDefaultAsync(f => f.Id == id && f.Student!.SchoolId == schoolId);
        if (fee is null) return NotFound();

        if (!Enum.TryParse<FeeStatus>(request.Status, true, out var status))
        {
            return BadRequest(new { message = $"Invalid fee status '{request.Status}'." });
        }

        fee.Status = status;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
