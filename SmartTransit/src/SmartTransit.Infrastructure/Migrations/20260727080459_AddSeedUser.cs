using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTransit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSeedUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4600));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4630));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4630));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4640));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4640));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsDeleted", "IsEmailConfirmed", "PasswordHash", "Role" },
                values: new object[] { new Guid("99999999-9999-9999-9999-999999999999"), new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "sefa@smarttransit.com", false, true, "hashedpassword", 1 });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 4, 59, 783, DateTimeKind.Utc).AddTicks(4620));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"));

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3750));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3820));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3820));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3820));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3820));

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 7, 2, 41, 152, DateTimeKind.Utc).AddTicks(3800));
        }
    }
}
