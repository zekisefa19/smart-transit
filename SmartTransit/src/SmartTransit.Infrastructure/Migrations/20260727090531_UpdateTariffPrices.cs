using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace SmartTransit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTariffPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6900));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 46.20m, new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6930) });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 22.55m, new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6930) });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6940));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 33.00m, new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6940) });

            migrationBuilder.InsertData(
                table: "Tariffs",
                columns: new[] { "Id", "BasePrice", "CardType", "CreatedAt", "IsActive", "TransferDiscountPercent" },
                values: new object[,]
                {
                    { new Guid("77777777-7777-7777-7777-777777777777"), 0.00m, 5, new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6940), true, 0.00m },
                    { new Guid("88888888-8888-8888-8888-888888888888"), 0.00m, 6, new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6950), true, 0.00m }
                });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 9, 5, 31, 321, DateTimeKind.Utc).AddTicks(6920));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"));

            migrationBuilder.DeleteData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"));

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9560));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 20.00m, new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9580) });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 10.00m, new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9590) });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9590));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "BasePrice", "CreatedAt" },
                values: new object[] { 14.00m, new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9590) });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 27, 8, 21, 34, 669, DateTimeKind.Utc).AddTicks(9570));
        }
    }
}
