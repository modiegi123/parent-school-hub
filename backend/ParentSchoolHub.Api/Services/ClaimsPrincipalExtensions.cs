using System.Security.Claims;
using ParentSchoolHub.Api.Models;

namespace ParentSchoolHub.Api.Services;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);

    public static int GetSchoolId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue("schoolId")!);

    public static UserRole FindFirstRole(this ClaimsPrincipal user) =>
        Enum.Parse<UserRole>(user.FindFirstValue(ClaimTypes.Role)!);
}
