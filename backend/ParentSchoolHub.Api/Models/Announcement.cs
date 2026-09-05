namespace ParentSchoolHub.Api.Models;

public class Announcement
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public int SchoolId { get; set; }
    public School? School { get; set; }

    public int AuthorUserId { get; set; }
    public User? Author { get; set; }
}
