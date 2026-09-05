namespace ParentSchoolHub.Api.Models;

// Data model only for now — no controller/UI/PDF generation yet.
public class ReportCard
{
    public int Id { get; set; }
    public string Term { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public DateTime IssuedAt { get; set; }

    public int StudentId { get; set; }
    public Student? Student { get; set; }
}
