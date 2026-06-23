using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InventoryManagement.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace InventoryManagement.Api.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IMemoryCache _cache;

        public PermissionAuthorizationHandler(IServiceProvider serviceProvider, IMemoryCache cache)
        {
            _serviceProvider = serviceProvider;
            _cache = cache;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (context.User == null)
            {
                return;
            }

            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return;
            }

            var cacheKey = $"UserPermissions_{userId}";

            if (!_cache.TryGetValue(cacheKey, out List<string>? userPermissions))
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<IAppDbContext>();

                var user = await dbContext.Users
                    .Include(u => u.Role)
                    .ThenInclude(r => r.RolePermissions)
                    .ThenInclude(rp => rp.Permission)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user?.Role == null)
                {
                    return;
                }

                if (user.Role.Name == "SuperAdmin")
                {
                    userPermissions = new List<string> { "SuperAdmin" };
                }
                else
                {
                    userPermissions = user.Role.RolePermissions.Select(rp => rp.Permission.SystemName).ToList();
                }

                _cache.Set(cacheKey, userPermissions, TimeSpan.FromMinutes(10));
            }

            if (userPermissions != null && (userPermissions.Contains("SuperAdmin") || userPermissions.Contains(requirement.Permission)))
            {
                context.Succeed(requirement);
            }
        }
    }
}
