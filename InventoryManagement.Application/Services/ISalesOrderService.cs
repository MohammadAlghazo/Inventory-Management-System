using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;

namespace InventoryManagement.Application.Services
{
    public interface ISalesOrderService
    {
        Task<PagedResult<SalesOrderDto>> GetSalesOrdersAsync(int page, int pageSize, string? search);
        Task<ApiResponse<SalesOrderDto>> GetSalesOrderByIdAsync(int id);
        Task<ApiResponse<SalesOrderDto>> CreateSalesOrderAsync(CreateSalesOrderDto dto, int userId);
        Task<ApiResponse<object>> ShipSalesOrderAsync(ShipSalesOrderDto dto, int userId);
    }
}
