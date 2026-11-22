namespace ParentSchoolHub.Api.Dtos;

public record HomeworkDto(int Id, string Title, string Description, DateOnly DueDate, int ClassRoomId, string ClassRoomName, string CreatedByName);

public record CreateHomeworkRequest(int ClassRoomId, string Title, string Description, DateOnly DueDate);

public record UpdateHomeworkRequest(string Title, string Description, DateOnly DueDate);
