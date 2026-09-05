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
[Route("api/announcements")]
public class AnnouncementsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnnouncementsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<AnnouncementDto>>> GetAll()
    {
        var schoolId = User.GetSchoolId();

        var announcements = await _db.Announcements
            .Where(a => a.SchoolId == schoolId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Body, a.CreatedAt, a.Author!.Name))
            .ToListAsync();

        return announcements;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AnnouncementDto>> GetById(int id)
    {
        var schoolId = User.GetSchoolId();

        var announcement = await _db.Announcements
            .Where(a => a.Id == id && a.SchoolId == schoolId)
            .Select(a => new AnnouncementDto(a.Id, a.Title, a.Body, a.CreatedAt, a.Author!.Name))
            .FirstOrDefaultAsync();

        return announcement is null ? NotFound() : announcement;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<ActionResult<AnnouncementDto>> Create(CreateAnnouncementRequest request)
    {
        var announcement = new Announcement
        {
            SchoolId = User.GetSchoolId(),
            AuthorUserId = User.GetUserId(),
            Title = request.Title,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow
        };

        _db.Announcements.Add(announcement);
        await _db.SaveChangesAsync();

        var author = await _db.Users.FindAsync(announcement.AuthorUserId);
        var dto = new AnnouncementDto(announcement.Id, announcement.Title, announcement.Body, announcement.CreatedAt, author!.Name);
        return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Update(int id, UpdateAnnouncementRequest request)
    {
        var schoolId = User.GetSchoolId();
        var announcement = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id && a.SchoolId == schoolId);
        if (announcement is null) return NotFound();

        announcement.Title = request.Title;
        announcement.Body = request.Body;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Teacher")]
    public async Task<IActionResult> Delete(int id)
    {
        var schoolId = User.GetSchoolId();
        var announcement = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id && a.SchoolId == schoolId);
        if (announcement is null) return NotFound();

        _db.Announcements.Remove(announcement);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
