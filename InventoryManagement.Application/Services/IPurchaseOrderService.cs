using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IPurchaseOrderService
    {
        Task<ApiResponse<PagedResult<PurchaseOrderDto>>> GetPurchaseOrdersAsync(int page, int pageSize, string? search);
        Task<ApiResponse<PurchaseOrderDto>> GetPurchaseOrderByIdAsync(int id);
        Task<ApiResponse<PurchaseOrderDto>> CreatePurchaseOrderAsync(CreatePurchaseOrderDto dto, int userId);
        Task<ApiResponse<object>> ReceivePurchaseOrderAsync(int id, ReceivePurchaseOrderDto dto, int userId);
    }
}
