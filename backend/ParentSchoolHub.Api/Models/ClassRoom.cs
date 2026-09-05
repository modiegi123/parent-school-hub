namespace ParentSchoolHub.Api.Models;

public class ClassRoom
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public int SchoolId { get; set; }
    public School? School { get; set; }

    public int? TeacherId { get; set; }
    public User? Teacher { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Homework> Homeworks { get; set; } = new List<Homework>();
}
