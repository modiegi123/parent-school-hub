using Microsoft.AspNetCore.Identity;
using ParentSchoolHub.Api.Models;

namespace ParentSchoolHub.Api.Data;

public static class DbSeeder
{
    // Demo credentials (password for every seeded account is "Password123!"):
    //   admin@brightfield.edu   (Admin)
    //   teacher@brightfield.edu (Teacher)
    //   parent@brightfield.edu  (Parent, linked to both seeded students)
    public static void Seed(AppDbContext db)
    {
        if (db.Schools.Any()) return;

        var hasher = new PasswordHasher<User>();
        const string demoPassword = "Password123!";

        var school = new School { Name = "Brightfield Primary School", Address = "12 Baobab Street" };
        db.Schools.Add(school);
        db.SaveChanges();

        var admin = new User { Name = "Ada Admin", Email = "admin@brightfield.edu", Role = UserRole.Admin, SchoolId = school.Id };
        var teacher = new User { Name = "Tom Teacher", Email = "teacher@brightfield.edu", Role = UserRole.Teacher, SchoolId = school.Id };
        var parent = new User { Name = "Pat Parent", Email = "parent@brightfield.edu", Role = UserRole.Parent, SchoolId = school.Id };

        admin.PasswordHash = hasher.HashPassword(admin, demoPassword);
        teacher.PasswordHash = hasher.HashPassword(teacher, demoPassword);
        parent.PasswordHash = hasher.HashPassword(parent, demoPassword);

        db.Users.AddRange(admin, teacher, parent);
        db.SaveChanges();

        var classRoom = new ClassRoom { Name = "Grade 4A", SchoolId = school.Id, TeacherId = teacher.Id };
        db.Classes.Add(classRoom);
        db.SaveChanges();

        var student1 = new Student { Name = "Sam Student", SchoolId = school.Id, ClassRoomId = classRoom.Id, DateOfBirth = new DateOnly(2016, 3, 12) };
        var student2 = new Student { Name = "Sipho Scholar", SchoolId = school.Id, ClassRoomId = classRoom.Id, DateOfBirth = new DateOnly(2016, 7, 2) };
        db.Students.AddRange(student1, student2);
        db.SaveChanges();

        db.ParentStudents.AddRange(
            new ParentStudent { ParentUserId = parent.Id, StudentId = student1.Id },
            new ParentStudent { ParentUserId = parent.Id, StudentId = student2.Id }
        );

        db.Announcements.Add(new Announcement
        {
            SchoolId = school.Id,
            AuthorUserId = admin.Id,
            Title = "Welcome to Parent-School Hub",
            Body = "This is where you'll find school announcements, attendance, and more.",
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }
}
