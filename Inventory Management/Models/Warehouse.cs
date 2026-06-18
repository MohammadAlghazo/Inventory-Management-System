namespace Inventory_Management.Models
{
    public class Warehouse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ManagerName { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Relationships
        public int? BranchId { get; set; }
        public Branch? Branch { get; set; }

        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    }
}
