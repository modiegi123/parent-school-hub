namespace ParentSchoolHub.Api.Models;

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateOnly? DateOfBirth { get; set; }

    public int SchoolId { get; set; }
    public School? School { get; set; }

    public int? ClassRoomId { get; set; }
    public ClassRoom? ClassRoom { get; set; }

    public ICollection<ParentStudent> Parents { get; set; } = new List<ParentStudent>();
    public ICollection<AttendanceRecord> AttendanceRecords { get; set; } = new List<AttendanceRecord>();
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<Fee> Fees { get; set; } = new List<Fee>();
    public ICollection<ReportCard> ReportCards { get; set; } = new List<ReportCard>();
}

public class ParentStudent
{
    public int ParentUserId { get; set; }
    public User? ParentUser { get; set; }

    public int StudentId { get; set; }
    public Student? Student { get; set; }
}
