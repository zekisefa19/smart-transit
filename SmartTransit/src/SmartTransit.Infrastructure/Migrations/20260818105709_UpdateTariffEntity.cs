using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTransit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTariffEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Tariffs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsFree",
                table: "Tariffs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "PrintingFee",
                table: "Tariffs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ServiceFee",
                table: "Tariffs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "SinglePassFee",
                table: "Tariffs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Subtitle",
                table: "Tariffs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Title",
                table: "Tariffs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Transfer2DiscountPercent",
                table: "Tariffs",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(1980));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2010), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2010), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2010), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2020), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2020), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                columns: new[] { "CreatedAt", "Description", "IsFree", "PrintingFee", "ServiceFee", "SinglePassFee", "Subtitle", "Title", "Transfer2DiscountPercent" },
                values: new object[] { new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(2020), "", false, 0m, 0m, 0m, "", "", 75.00m });

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 18, 10, 57, 9, 682, DateTimeKind.Utc).AddTicks(1990));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "IsFree",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "PrintingFee",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "ServiceFee",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "SinglePassFee",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "Subtitle",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "Title",
                table: "Tariffs");

            migrationBuilder.DropColumn(
                name: "Transfer2DiscountPercent",
                table: "Tariffs");

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(730));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(750));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(760));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(760));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(770));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(770));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(770));

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 8, 13, 9, 35, 47, 779, DateTimeKind.Utc).AddTicks(740));
        }
    }
}
