using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Inventory_Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IInventoryService
    {
        Task<ApiResponse<object>> AddItemAsync(AddInventoryDto dto, int userId);
        Task<ApiResponse<object>> SellProductAsync(SellProductDto dto, int userId);
        Task<ApiResponse<object>> AdjustStockAsync(AdjustStockDto dto, int userId);
        Task<ApiResponse<object>> ReturnProductAsync(ReturnProductDto dto, int userId);
        Task<ApiResponse<PagedResult<InventoryLogDto>>> GetAllLogsAsync(InventoryLogQueryParams query);
        Task<ApiResponse<List<InventoryLogDto>>> GetLogsByProductAsync(int productId);
    }
}

