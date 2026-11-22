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
[Route("api/events")]
public class EventsController : ControllerBase
{
    private readonly AppDbContext _db;

    public EventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SchoolEventDto>>> GetAll()
    {
        var schoolId = User.GetSchoolId();

        var events = await _db.SchoolEvents
            .Where(e => e.SchoolId == schoolId)
            .OrderBy(e => e.StartsAt)
            .Select(e => new SchoolEventDto(e.Id, e.Title, e.Location, e.StartsAt))
            .ToListAsync();

        return events;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SchoolEventDto>> Create(CreateEventRequest request)
    {
        var ev = new SchoolEvent
        {
            SchoolId = User.GetSchoolId(),
            Title = request.Title,
            Location = request.Location,
            StartsAt = request.StartsAt
        };

        _db.SchoolEvents.Add(ev);
        await _db.SaveChangesAsync();

        var dto = new SchoolEventDto(ev.Id, ev.Title, ev.Location, ev.StartsAt);
        return CreatedAtAction(nameof(GetAll), dto);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateEventRequest request)
    {
        var schoolId = User.GetSchoolId();
        var ev = await _db.SchoolEvents.FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);
        if (ev is null) return NotFound();

        ev.Title = request.Title;
        ev.Location = request.Location;
        ev.StartsAt = request.StartsAt;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var schoolId = User.GetSchoolId();
        var ev = await _db.SchoolEvents.FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);
        if (ev is null) return NotFound();

        _db.SchoolEvents.Remove(ev);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
