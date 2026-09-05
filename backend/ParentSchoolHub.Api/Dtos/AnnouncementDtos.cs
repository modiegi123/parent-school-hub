namespace ParentSchoolHub.Api.Dtos;

public record AnnouncementDto(int Id, string Title, string Body, DateTime CreatedAt, string AuthorName);

public record CreateAnnouncementRequest(string Title, string Body);

public record UpdateAnnouncementRequest(string Title, string Body);
