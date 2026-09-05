namespace ParentSchoolHub.Api.Models;

// Data model only for now — no controller/UI yet. Next module to build out.
public class Homework
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateOnly DueDate { get; set; }

    public int ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public int CreatedByUserId { get; set; }
    public User? CreatedBy { get; set; }
}
