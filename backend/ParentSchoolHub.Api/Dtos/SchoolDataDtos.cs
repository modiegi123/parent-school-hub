namespace ParentSchoolHub.Api.Dtos;

public record ClassRoomDto(int Id, string Name, string? TeacherName);

public record StudentSummaryDto(int Id, string Name, int? ClassRoomId, string? ClassRoomName);
