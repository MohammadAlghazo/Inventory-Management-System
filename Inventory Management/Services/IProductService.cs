using Inventory_Management.Common;
using Inventory_Management.Dtos.Product_Dtos;

namespace Inventory_Management.Services
{
    public interface IProductService
    {
        Task<ApiResponse<PagedResult<ProductDto>>> GetAllAsync(ProductQueryParams query);
        Task<ApiResponse<ProductDto>> GetByIdAsync(int id);
        Task<ApiResponse<ProductDto>> CreateAsync(CreateProductDto dto);
        Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductDto dto);
        Task<ApiResponse<object>> DeleteAsync(int id);
        Task<ApiResponse<List<ProductDto>>> GetLowStockAsync();
        Task<ApiResponse<List<string>>> GetCategoriesAsync();
        Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync();
    }
}

