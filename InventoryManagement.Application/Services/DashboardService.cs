using InventoryManagement.Domain.Entities;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Dashboard_Dtos;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IAppDbContext _db;

        public DashboardService(IAppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetStatsAsync()
        {
            var today = DateTime.UtcNow.Date;

            var stats = new DashboardStatsDto
            {
                TotalProducts      = await _db.Products.CountAsync(p => p.IsActive),
                LowStockCount      = await _db.Products.CountAsync(p => p.IsActive && p.Quantity <= p.MinQuantity && p.Quantity > 0),
                OutOfStockCount    = await _db.Products.CountAsync(p => p.IsActive && p.Quantity == 0),
                TotalInventoryValue= await _db.Products.Where(p => p.IsActive).SumAsync(p => p.Price * p.Quantity),
                TodayMovements     = await _db.InventoryLogs.CountAsync(l => l.ActionDate.Date == today),
                TotalUsers         = await _db.Users.CountAsync(u => u.IsActive),
                TotalCategories    = await _db.Products.Where(p => p.IsActive).Select(p => p.Category).Distinct().CountAsync()
            };

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }

        public async Task<ApiResponse<List<ActivityChartDto>>> GetActivityChartAsync(int days = 30)
        {
            var from = DateTime.UtcNow.Date.AddDays(-days + 1);

            var logs = await _db.InventoryLogs
                .Where(l => l.ActionDate >= from)
                .GroupBy(l => l.ActionDate.Date)
                .Select(g => new
                {
                    Date           = g.Key,
                    AddCount       = g.Count(l => l.Action == InventoryAction.Add),
                    SellCount      = g.Count(l => l.Action == InventoryAction.Sell),
                    AdjustCount    = g.Count(l => l.Action == InventoryAction.Adjust),
                    TotalMovements = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var result = new List<ActivityChartDto>();
            for (int i = 0; i < days; i++)
            {
                var targetDate = from.AddDays(i);
                var dateStr = targetDate.ToString("yyyy-MM-dd");
                var existing = logs.FirstOrDefault(l => l.Date.Date == targetDate.Date);

                if (existing != null)
                {
                    result.Add(new ActivityChartDto
                    {
                        Date = dateStr,
                        AddCount = existing.AddCount,
                        SellCount = existing.SellCount,
                        AdjustCount = existing.AdjustCount,
                        TotalMovements = existing.TotalMovements
                    });
                }
                else
                {
                    result.Add(new ActivityChartDto { Date = dateStr });
                }
            }

            return ApiResponse<List<ActivityChartDto>>.Ok(result);
        }

        public async Task<ApiResponse<List<CategoryBreakdownDto>>> GetCategoryBreakdownAsync()
        {
            var breakdown = await _db.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .GroupBy(p => p.Category != null ? p.Category.Name : "Uncategorized")
                .Select(g => new CategoryBreakdownDto
                {
                    Category     = g.Key,
                    ProductCount = g.Count(),
                    TotalValue   = g.Sum(p => p.Price * p.Quantity),
                    TotalQuantity= g.Sum(p => p.Quantity)
                })
                .OrderByDescending(x => x.TotalValue)
                .ToListAsync();

            return ApiResponse<List<CategoryBreakdownDto>>.Ok(breakdown);
        }

        public async Task<ApiResponse<List<TopProductDto>>> GetTopProductsAsync(int limit = 5)
        {
            var topProducts = await _db.InventoryLogs
                .Include(l => l.Product)
                .ThenInclude(p => p.Category)
                .Where(l => l.Product.IsActive)
                .GroupBy(l => new { l.ProductId, l.Product.Name, CategoryName = l.Product.Category != null ? l.Product.Category.Name : "Uncategorized", l.Product.Quantity })
                .Select(g => new TopProductDto
                {
                    ProductId      = g.Key.ProductId,
                    ProductName    = g.Key.Name,
                    Category       = g.Key.CategoryName,
                    TotalMovements = g.Count(),
                    CurrentQuantity= g.Key.Quantity
                })
                .OrderByDescending(x => x.TotalMovements)
                .Take(limit)
                .ToListAsync();

            return ApiResponse<List<TopProductDto>>.Ok(topProducts);
        }
    }
}

