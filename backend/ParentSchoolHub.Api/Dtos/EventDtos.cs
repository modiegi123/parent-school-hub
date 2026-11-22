namespace ParentSchoolHub.Api.Dtos;

public record SchoolEventDto(int Id, string Title, string? Location, DateTime StartsAt);

public record CreateEventRequest(string Title, string? Location, DateTime StartsAt);

public record UpdateEventRequest(string Title, string? Location, DateTime StartsAt);
