using Microsoft.EntityFrameworkCore;
using ParentSchoolHub.Api.Models;

namespace ParentSchoolHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<School> Schools => Set<School>();
    public DbSet<User> Users => Set<User>();
    public DbSet<ClassRoom> Classes => Set<ClassRoom>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<ParentStudent> ParentStudents => Set<ParentStudent>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    public DbSet<Homework> Homeworks => Set<Homework>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Fee> Fees => Set<Fee>();
    public DbSet<SchoolEvent> SchoolEvents => Set<SchoolEvent>();
    public DbSet<ReportCard> ReportCards => Set<ReportCard>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ParentStudent>()
            .HasKey(ps => new { ps.ParentUserId, ps.StudentId });

        modelBuilder.Entity<ParentStudent>()
            .HasOne(ps => ps.ParentUser)
            .WithMany(u => u.Children)
            .HasForeignKey(ps => ps.ParentUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ParentStudent>()
            .HasOne(ps => ps.Student)
            .WithMany(s => s.Parents)
            .HasForeignKey(ps => ps.StudentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<ClassRoom>()
            .HasOne(c => c.Teacher)
            .WithMany(u => u.TaughtClasses)
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Student>()
            .HasOne(s => s.ClassRoom)
            .WithMany(c => c.Students)
            .HasForeignKey(s => s.ClassRoomId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AttendanceRecord>()
            .HasIndex(a => new { a.StudentId, a.Date })
            .IsUnique();

        modelBuilder.Entity<AttendanceRecord>()
            .HasOne(a => a.MarkedBy)
            .WithMany()
            .HasForeignKey(a => a.MarkedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Announcement>()
            .HasOne(a => a.Author)
            .WithMany()
            .HasForeignKey(a => a.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
