namespace ParentSchoolHub.Api.Models;

// One row per successful login — powers the admin dashboard's "how often are
// teachers checking in" metric.
public class LoginActivity
{
    public int Id { get; set; }
    public DateTime OccurredAt { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}
