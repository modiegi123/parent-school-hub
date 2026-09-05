namespace ParentSchoolHub.Api.Models;

// Data model only for now — no controller/UI yet.
public class SchoolEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartsAt { get; set; }

    public int SchoolId { get; set; }
    public School? School { get; set; }
}
