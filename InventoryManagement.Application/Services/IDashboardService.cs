using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Dashboard_Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IDashboardService
    {
        Task<ApiResponse<DashboardStatsDto>> GetStatsAsync();
        Task<ApiResponse<List<ActivityChartDto>>> GetActivityChartAsync(int days = 30);
        Task<ApiResponse<List<CategoryBreakdownDto>>> GetCategoryBreakdownAsync();
        Task<ApiResponse<List<TopProductDto>>> GetTopProductsAsync(int limit = 5);
    }
}

