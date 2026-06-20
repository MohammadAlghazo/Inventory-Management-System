using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using InventoryManagement.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Authorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly IServiceProvider _serviceProvider;

        public PermissionAuthorizationHandler(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
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

            // SuperAdmin has all permissions implicitly
            if (user.Role.Name == "SuperAdmin")
            {
                context.Succeed(requirement);
                return;
            }

            var hasPermission = user.Role.RolePermissions
                .Any(rp => rp.Permission.SystemName == requirement.Permission);

            if (hasPermission)
            {
                context.Succeed(requirement);
                return;
            }
        }
    }
}
