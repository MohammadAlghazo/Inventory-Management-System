using Microsoft.AspNetCore.Authorization;

namespace InventoryManagement.Api.Authorization
{
    public class RequirePermissionAttribute : AuthorizeAttribute
    {
        const string POLICY_PREFIX = "RequirePermission_";

        public RequirePermissionAttribute(string permission) => Permission = permission;

        public string Permission
        {
            get
            {
                var parts = Policy?.Split(POLICY_PREFIX);
                if (parts != null && parts.Length > 1)
                {
                    return parts[1];
                }
                return string.Empty;
            }
            set
            {
                Policy = $"{POLICY_PREFIX}{value}";
            }
        }
    }
}
