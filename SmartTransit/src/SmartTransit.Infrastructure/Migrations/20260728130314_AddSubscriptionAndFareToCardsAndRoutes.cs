using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartTransit.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndFareToCardsAndRoutes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "StandardFare",
                table: "Routes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionDeduction",
                table: "Routes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "HasActiveSubscription",
                table: "Cards",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionExpiryDate",
                table: "Cards",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SubscriptionRemainingUses",
                table: "Cards",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "CreatedAt", "StandardFare", "SubscriptionDeduction" },
                values: new object[] { new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1010), 20.00m, 1 });

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

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 13, 3, 14, 76, DateTimeKind.Utc).AddTicks(1030));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StandardFare",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "SubscriptionDeduction",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "HasActiveSubscription",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "SubscriptionExpiryDate",
                table: "Cards");

            migrationBuilder.DropColumn(
                name: "SubscriptionRemainingUses",
                table: "Cards");

            migrationBuilder.UpdateData(
                table: "Routes",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5350));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5420));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5420));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Tariffs",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5430));

            migrationBuilder.UpdateData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2026, 7, 28, 9, 38, 47, 167, DateTimeKind.Utc).AddTicks(5360));
        }
    }
}
