namespace ParentSchoolHub.Api.Models;

public class Grade
{
    public int Id { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Term { get; set; } = string.Empty;
    public decimal Score { get; set; }

    public int StudentId { get; set; }
    public Student? Student { get; set; }
}
