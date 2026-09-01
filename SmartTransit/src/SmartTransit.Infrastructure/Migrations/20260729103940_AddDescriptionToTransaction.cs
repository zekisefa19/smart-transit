using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTransit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"));

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Transactions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionDeduction",
                table: "Transactions",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2460));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2480));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2490));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2490));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2490));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2500));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2500));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CodeExpiry", "CreatedAt", "Email", "EmailConfirmationCode", "FullName", "IsDeleted", "IsEmailConfirmed", "PasswordHash", "Role" },
                values: new object[] { new Guid("00000000-0000-0000-0000-000000000001"), null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@smarttransit.com", null, "", false, true, "hashedpassword", 3 });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 29, 10, 39, 40, 348, DateTimeKind.Utc).AddTicks(2470));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "SubscriptionDeduction",
                table: "Transactions");

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1010));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1040));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1040));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1050));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1050));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1050));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1060));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CodeExpiry", "CreatedAt", "Email", "EmailConfirmationCode", "FullName", "IsDeleted", "IsEmailConfirmed", "PasswordHash", "Role" },
                values: new object[] { new Guid("99999999-9999-9999-9999-999999999999"), null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "sefa@smarttransit.com", null, "", false, true, "hashedpassword", 1 });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1030));
        }
    }
}
