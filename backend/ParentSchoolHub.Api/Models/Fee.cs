namespace ParentSchoolHub.Api.Models;

public enum FeeStatus
{
    Pending,
    Paid,
    Overdue
}

// Data model only for now — no controller/UI or payment gateway integration yet.
public class Fee
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public FeeStatus Status { get; set; }

    public int StudentId { get; set; }
    public Student? Student { get; set; }
}
