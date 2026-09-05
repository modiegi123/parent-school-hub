namespace ParentSchoolHub.Api.Models;

public enum UserRole
{
    Admin,
    Teacher,
    Parent
}

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }

    public int SchoolId { get; set; }
    public School? School { get; set; }

    public ICollection<ParentStudent> Children { get; set; } = new List<ParentStudent>();
    public ICollection<ClassRoom> TaughtClasses { get; set; } = new List<ClassRoom>();
}
