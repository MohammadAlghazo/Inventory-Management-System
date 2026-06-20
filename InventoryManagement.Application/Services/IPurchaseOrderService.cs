using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IPurchaseOrderService
    {
        Task<PagedResult<PurchaseOrderDto>> GetPurchaseOrdersAsync(int page, int pageSize, string? search);
        Task<ApiResponse<PurchaseOrderDto>> GetPurchaseOrderByIdAsync(int id);
        Task<ApiResponse<PurchaseOrderDto>> CreatePurchaseOrderAsync(CreatePurchaseOrderDto dto, int userId);
        Task<ApiResponse<object>> ReceivePurchaseOrderAsync(int id, int userId);
    }
}
