namespace ParentSchoolHub.Api.Models;

public class SchoolEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartsAt { get; set; }

    public int SchoolId { get; set; }
    public School? School { get; set; }
}
