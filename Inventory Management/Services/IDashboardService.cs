using Inventory_Management.Common;
using Inventory_Management.Dtos.Dashboard_Dtos;

namespace Inventory_Management.Services
{
    public interface IDashboardService
    {
        Task<ApiResponse<DashboardStatsDto>> GetStatsAsync();
        Task<ApiResponse<List<ActivityChartDto>>> GetActivityChartAsync(int days = 30);
        Task<ApiResponse<List<CategoryBreakdownDto>>> GetCategoryBreakdownAsync();
        Task<ApiResponse<List<TopProductDto>>> GetTopProductsAsync(int limit = 5);
    }
}

