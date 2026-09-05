namespace ParentSchoolHub.Api.Dtos;

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, string Name, string Email, string Role, int SchoolId, int UserId);
