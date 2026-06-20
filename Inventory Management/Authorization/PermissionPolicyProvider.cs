using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace InventoryManagement.Api.Authorization
{
    public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
        {
        }

        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            var policy = await base.GetPolicyAsync(policyName);
            if (policy == null && policyName.StartsWith("RequirePermission_", StringComparison.OrdinalIgnoreCase))
            {
                var permission = policyName.Substring("RequirePermission_".Length);
                var policyBuilder = new AuthorizationPolicyBuilder();
                policyBuilder.AddRequirements(new PermissionRequirement(permission));
                return policyBuilder.Build();
            }

            return policy;
        }
    }
}
