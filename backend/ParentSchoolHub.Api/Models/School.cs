namespace ParentSchoolHub.Api.Models;

public class School
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<ClassRoom> Classes { get; set; } = new List<ClassRoom>();
    public ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    public ICollection<SchoolEvent> Events { get; set; } = new List<SchoolEvent>();
}
