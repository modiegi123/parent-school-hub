namespace ParentSchoolHub.Api.Dtos;

public record FeeDto(int Id, string Description, decimal Amount, DateOnly DueDate, string Status, int StudentId, string StudentName);

public record CreateFeeRequest(int StudentId, string Description, decimal Amount, DateOnly DueDate);

public record UpdateFeeStatusRequest(string Status);
