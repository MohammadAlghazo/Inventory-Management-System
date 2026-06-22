namespace InventoryManagement.Domain.Constants
{
    public static class RoleConstants
    {
        public const string SuperAdmin = "SuperAdmin";
        public const string InventoryManager = "InventoryManager";
        public const string PurchasingOfficer = "PurchasingOfficer";
        public const string Sales = "Sales";
        public const string WarehouseStaff = "WarehouseStaff";
        public const string Auditor = "Auditor";
        public const string Accountant = "Accountant";
        
        // This is a comma separated string for use in [Authorize(Roles = ...)]
        public const string AdminOrManager = $"{SuperAdmin},{InventoryManager}";
    }
}
