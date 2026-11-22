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
        var student3 = new Student { Name = "Thandi Third", SchoolId = school.Id, ClassRoomId = classRoom.Id, DateOfBirth = new DateOnly(2016, 1, 20) };
        db.Students.AddRange(student1, student2, student3);
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

        db.Homeworks.AddRange(
            new Homework
            {
                ClassRoomId = classRoom.Id,
                Title = "Reading: Chapter 3",
                Description = "Read chapter 3 of 'The Great Adventure' and answer the questions on page 42.",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(3)),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = teacher.Id
            },
            new Homework
            {
                ClassRoomId = classRoom.Id,
                Title = "Maths worksheet: Fractions",
                Description = "Complete the fractions worksheet handed out in class.",
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = teacher.Id
            }
        );

        const string currentTerm = "Term 4 2026";
        db.Grades.AddRange(
            new Grade { StudentId = student1.Id, Subject = "Mathematics", Term = currentTerm, Score = 78 },
            new Grade { StudentId = student1.Id, Subject = "English", Term = currentTerm, Score = 85 },
            new Grade { StudentId = student2.Id, Subject = "Mathematics", Term = currentTerm, Score = 58 },
            new Grade { StudentId = student2.Id, Subject = "English", Term = currentTerm, Score = 62 },
            new Grade { StudentId = student3.Id, Subject = "Mathematics", Term = currentTerm, Score = 35 },
            new Grade { StudentId = student3.Id, Subject = "English", Term = currentTerm, Score = 42 }
        );

        var markedByTeacherDays = new[] { 1, 2, 3, 6, 7 };
        foreach (var daysAgo in markedByTeacherDays)
        {
            var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-daysAgo));
            db.AttendanceRecords.AddRange(
                new AttendanceRecord { StudentId = student1.Id, ClassRoomId = classRoom.Id, Date = date, Status = AttendanceStatus.Present, MarkedByUserId = teacher.Id },
                new AttendanceRecord { StudentId = student2.Id, ClassRoomId = classRoom.Id, Date = date, Status = daysAgo == 3 ? AttendanceStatus.Absent : AttendanceStatus.Present, MarkedByUserId = teacher.Id },
                new AttendanceRecord { StudentId = student3.Id, ClassRoomId = classRoom.Id, Date = date, Status = daysAgo is 2 or 7 ? AttendanceStatus.Late : AttendanceStatus.Present, MarkedByUserId = teacher.Id }
            );
        }

        var teacherLoginDays = new[] { 1, 2, 4, 8, 12 };
        foreach (var daysAgo in teacherLoginDays)
        {
            db.LoginActivities.Add(new LoginActivity { UserId = teacher.Id, OccurredAt = DateTime.UtcNow.AddDays(-daysAgo) });
        }

        var parentLoginDays = new[] { 2, 9 };
        foreach (var daysAgo in parentLoginDays)
        {
            db.LoginActivities.Add(new LoginActivity { UserId = parent.Id, OccurredAt = DateTime.UtcNow.AddDays(-daysAgo) });
        }

        db.LoginActivities.Add(new LoginActivity { UserId = admin.Id, OccurredAt = DateTime.UtcNow });

        db.Fees.AddRange(
            new Fee
            {
                StudentId = student1.Id,
                Description = "Term 4 tuition fee",
                Amount = 2500m,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
                Status = FeeStatus.Pending
            },
            new Fee
            {
                StudentId = student2.Id,
                Description = "Term 4 tuition fee",
                Amount = 2500m,
                DueDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)),
                Status = FeeStatus.Paid
            }
        );

        db.SchoolEvents.AddRange(
            new SchoolEvent
            {
                SchoolId = school.Id,
                Title = "Parent-Teacher Evening",
                Location = "Main Hall",
                StartsAt = DateTime.UtcNow.AddDays(10)
            },
            new SchoolEvent
            {
                SchoolId = school.Id,
                Title = "Sports Day",
                Location = "School Field",
                StartsAt = DateTime.UtcNow.AddDays(21)
            }
        );

        db.SaveChanges();
    }
}
