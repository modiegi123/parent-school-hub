using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ParentSchoolHub.Api.Migrations
{
    /// <inheritdoc />
    public partial class HomeworkCreatedByRestrict : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Homeworks_Users_CreatedById",
                table: "Homeworks");

            migrationBuilder.DropIndex(
                name: "IX_Homeworks_CreatedById",
                table: "Homeworks");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Homeworks");

            migrationBuilder.CreateIndex(
                name: "IX_Homeworks_CreatedByUserId",
                table: "Homeworks",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Homeworks_Users_CreatedByUserId",
                table: "Homeworks",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Homeworks_Users_CreatedByUserId",
                table: "Homeworks");

            migrationBuilder.DropIndex(
                name: "IX_Homeworks_CreatedByUserId",
                table: "Homeworks");

            migrationBuilder.AddColumn<int>(
                name: "CreatedById",
                table: "Homeworks",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Homeworks_CreatedById",
                table: "Homeworks",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Homeworks_Users_CreatedById",
                table: "Homeworks",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
