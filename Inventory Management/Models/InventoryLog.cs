namespace Inventory_Management.Models
{
    public enum InventoryAction
    {
        Add,
        Sell,
        Adjust,
        Return,
        Transfer
    }

    public class InventoryLog
    {
        public int Id { get; set; }
        public InventoryAction Action { get; set; }
        public int QuantityChanged { get; set; }
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public string? Notes { get; set; }
        public DateTime ActionDate { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int? UserId { get; set; }
        public User? User { get; set; }

        public int? WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }

        public int? BranchId { get; set; }
        public Branch? Branch { get; set; }

        public int? TargetWarehouseId { get; set; } // For transfers
        public Warehouse? TargetWarehouse { get; set; }
    }
}
