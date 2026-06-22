using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Product_Dtos;

using InventoryManagement.Application.Dtos.Dashboard_Dtos;

namespace InventoryManagement.Application.Services
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
        Task<ApiResponse<object>> ImportFromExcelAsync(Stream fileStream);
    }
}

