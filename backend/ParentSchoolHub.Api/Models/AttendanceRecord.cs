namespace ParentSchoolHub.Api.Models;

public enum AttendanceStatus
{
    Present,
    Absent,
    Late
}

public class AttendanceRecord
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public AttendanceStatus Status { get; set; }

    public int StudentId { get; set; }
    public Student? Student { get; set; }

    public int ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public int MarkedByUserId { get; set; }
    public User? MarkedBy { get; set; }
}
