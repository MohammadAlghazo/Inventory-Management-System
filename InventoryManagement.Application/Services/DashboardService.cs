using InventoryManagement.Domain.Entities;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Dashboard_Dtos;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace InventoryManagement.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMemoryCache _cache;

        public DashboardService(IUnitOfWork uow, IMemoryCache cache)
        {
            _uow = uow;
            _cache = cache;
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetStatsAsync()
        {
            const string cacheKey = "Dashboard_Stats";
            if (_cache.TryGetValue(cacheKey, out DashboardStatsDto? cachedStats))
            {
                return ApiResponse<DashboardStatsDto>.Ok(cachedStats!);
            }

            var today = DateTime.UtcNow.Date;

            var stats = new DashboardStatsDto
            {
                TotalProducts      = await _uow.Products.Query().CountAsync(p => p.IsActive),
                LowStockCount      = await _uow.Products.Query().CountAsync(p => p.IsActive && p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity) && p.ProductStocks.Sum(s => s.Quantity) > 0),
                OutOfStockCount    = await _uow.Products.Query().CountAsync(p => p.IsActive && p.ProductStocks.Sum(s => s.Quantity) == 0),
                TotalInventoryValue= await _uow.Products.Query().Where(p => p.IsActive).SumAsync(p => p.Price * p.ProductStocks.Sum(s => s.Quantity)),
                TodayMovements     = await _uow.InventoryLogs.Query().CountAsync(l => l.ActionDate.Date == today),
                TotalUsers         = await _uow.Users.Query().CountAsync(u => u.IsActive),
                TotalCategories    = await _uow.Products.Query().Where(p => p.IsActive).Select(p => p.Category).Distinct().CountAsync()
            };

            _cache.Set(cacheKey, stats, TimeSpan.FromMinutes(1));

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }

        public async Task<ApiResponse<List<ActivityChartDto>>> GetActivityChartAsync(int days = 30)
        {
            var cacheKey = $"Dashboard_ActivityChart_{days}";
            if (_cache.TryGetValue(cacheKey, out List<ActivityChartDto>? cachedChart))
            {
                return ApiResponse<List<ActivityChartDto>>.Ok(cachedChart!);
            }

            var from = DateTime.UtcNow.Date.AddDays(-days + 1);

            var logs = await _uow.InventoryLogs.Query()
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

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(1));

            return ApiResponse<List<ActivityChartDto>>.Ok(result);
        }

        public async Task<ApiResponse<List<CategoryBreakdownDto>>> GetCategoryBreakdownAsync()
        {
            const string cacheKey = "Dashboard_CategoryBreakdown";
            if (_cache.TryGetValue(cacheKey, out List<CategoryBreakdownDto>? cachedBreakdown))
            {
                return ApiResponse<List<CategoryBreakdownDto>>.Ok(cachedBreakdown!);
            }

            var breakdown = await _uow.Products.Query()
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .GroupBy(p => p.Category != null ? p.Category.Name : "Uncategorized")
                .Select(g => new CategoryBreakdownDto
                {
                    Category     = g.Key,
                    ProductCount = g.Count(),
                    TotalValue   = g.Sum(p => p.Price * p.ProductStocks.Sum(s => s.Quantity)),
                    TotalQuantity= g.Sum(p => p.ProductStocks.Sum(s => s.Quantity))
                })
                .OrderByDescending(x => x.TotalValue)
                .ToListAsync();

            _cache.Set(cacheKey, breakdown, TimeSpan.FromMinutes(1));

            return ApiResponse<List<CategoryBreakdownDto>>.Ok(breakdown);
        }

        public async Task<ApiResponse<List<TopProductDto>>> GetTopProductsAsync(int limit = 5)
        {
            var cacheKey = $"Dashboard_TopProducts_{limit}";
            if (_cache.TryGetValue(cacheKey, out List<TopProductDto>? cachedTop))
            {
                return ApiResponse<List<TopProductDto>>.Ok(cachedTop!);
            }

            var topProducts = await _uow.InventoryLogs.Query()
                .Include(l => l.Product)
                .ThenInclude(p => p.Category)
                .Include(l => l.Product.ProductStocks)
                .Where(l => l.Product.IsActive)
                .Select(l => new { l.ProductId, l.Product.Name, CategoryName = l.Product.Category != null ? l.Product.Category.Name : "Uncategorized", TotalQuantity = l.Product.ProductStocks.Sum(s => s.Quantity) })
                .GroupBy(x => new { x.ProductId, x.Name, x.CategoryName, x.TotalQuantity })
                .Select(g => new TopProductDto
                {
                    ProductId      = g.Key.ProductId,
                    ProductName    = g.Key.Name,
                    Category       = g.Key.CategoryName,
                    TotalMovements = g.Count(),
                    CurrentQuantity= g.Key.TotalQuantity
                })
                .OrderByDescending(x => x.TotalMovements)
                .Take(limit)
                .ToListAsync();

            _cache.Set(cacheKey, topProducts, TimeSpan.FromMinutes(1));

            return ApiResponse<List<TopProductDto>>.Ok(topProducts);
        }
    }
}

