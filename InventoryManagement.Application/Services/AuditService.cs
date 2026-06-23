using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Common;
using InventoryManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class AuditService : IAuditService
    {
        private readonly IUnitOfWork _uow;

        public AuditService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<PagedResult<AuditLogDto>>> GetAuditLogsAsync(AuditLogQueryParams query)
        {
            var dbQuery = _uow.ActivityLogs.Query()
                .Include(a => a.User)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var lowerSearch = query.Search.ToLower();
                dbQuery = dbQuery.Where(a => 
                    a.Action.ToLower().Contains(lowerSearch) || 
                    a.Module.ToLower().Contains(lowerSearch) || 
                    a.Details.ToLower().Contains(lowerSearch) ||
                    (a.User != null && a.User.Username.ToLower().Contains(lowerSearch)));
            }

            var totalCount = await dbQuery.CountAsync();
            var clampedPageSize = Math.Min(query.PageSize, 100);

            var items = await dbQuery
                .OrderByDescending(a => a.Timestamp)
                .Skip((query.Page - 1) * clampedPageSize)
                .Take(clampedPageSize)
                .Select(a => new AuditLogDto
                {
                    Id = a.Id,
                    Username = a.User != null ? a.User.Username : "System",
                    Action = a.Action,
                    Module = a.Module,
                    Details = a.Details,
                    IpAddress = a.IpAddress,
                    Timestamp = a.Timestamp
                })
                .ToListAsync();

            return ApiResponse<PagedResult<AuditLogDto>>.Ok(new PagedResult<AuditLogDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }
    }
}
