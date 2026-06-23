using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;

namespace InventoryManagement.Application.Services
{
    public interface IAuditService
    {
        Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(AuditLogQueryParams query);
    }
}
