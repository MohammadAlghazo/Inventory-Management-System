using System.Security.Claims;
using InventoryManagement.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace InventoryManagement.Infrastructure.Data
{
    public class AuditTrailInterceptor : SaveChangesInterceptor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditTrailInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
        {
            AuditChanges(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {
            AuditChanges(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void AuditChanges(DbContext? context)
        {
            if (context == null) return;

            var entries = context.ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified || e.State == EntityState.Deleted)
                .ToList();

            if (!entries.Any()) return;

            var currentUserId = GetCurrentUserId();
            var ipAddress = GetIpAddress();
            var logs = new List<ActivityLog>();

            foreach (var entry in entries)
            {
                if (entry.Entity is ActivityLog) continue; // Avoid auditing audit logs!

                var entityType = entry.Entity.GetType().Name;
                var action = entry.State.ToString();

                bool isSensitive = false;
                string details = "";

                if (entry.State == EntityState.Deleted)
                {
                    isSensitive = true;
                    details = $"Deleted {entityType} with ID/properties: {GetPrimaryKeyValue(entry)}";
                }
                else if (entry.Entity is User user && entry.State == EntityState.Modified)
                {
                    var roleIdProperty = entry.Property("RoleId");
                    if (roleIdProperty.IsModified)
                    {
                        isSensitive = true;
                        details = $"Updated User '{user.Username}' RoleId from {roleIdProperty.OriginalValue} to {roleIdProperty.CurrentValue}.";
                    }
                    var isActiveProperty = entry.Property("IsActive");
                    if (isActiveProperty.IsModified)
                    {
                        isSensitive = true;
                        details = $"Updated User '{user.Username}' IsActive from {isActiveProperty.OriginalValue} to {isActiveProperty.CurrentValue}.";
                    }
                }
                else if (entry.Entity is ProductStock stock && entry.State == EntityState.Modified)
                {
                    var qtyProperty = entry.Property("Quantity");
                    if (qtyProperty.IsModified)
                    {
                        isSensitive = true;
                        details = $"Manual stock adjustment for ProductId {stock.ProductId} in WarehouseId {stock.WarehouseId} from {qtyProperty.OriginalValue} to {qtyProperty.CurrentValue}.";
                    }
                }
                else if (entry.State == EntityState.Modified)
                {
                    var isActiveProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsActive");
                    if (isActiveProp != null && isActiveProp.IsModified && false.Equals(isActiveProp.CurrentValue))
                    {
                        isSensitive = true;
                        details = $"Soft-deleted {entityType} with ID {GetPrimaryKeyValue(entry)}";
                    }
                }

                if (isSensitive)
                {
                    logs.Add(new ActivityLog
                    {
                        UserId = currentUserId,
                        Action = action,
                        Module = entityType,
                        Details = details,
                        IpAddress = ipAddress,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }

            if (logs.Any())
            {
                context.AddRange(logs);
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdString, out var userId))
            {
                return userId;
            }
            return null;
        }

        private string? GetIpAddress()
        {
            return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
        }

        private string GetPrimaryKeyValue(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            var primaryKey = entry.Metadata.FindPrimaryKey();
            if (primaryKey == null) return string.Empty;

            var values = primaryKey.Properties
                .Select(p => $"{p.Name}: {entry.Property(p.Name).CurrentValue}")
                .ToList();

            return string.Join(", ", values);
        }
    }
}
