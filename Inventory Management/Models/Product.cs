namespace Inventory_Management.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;          // Stock Keeping Unit
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int MinQuantity { get; set; }                     // Low stock threshold
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Unit { get; set; } = "piece";              // piece | kg | liter | box | etc.
        public string? ImageUrl { get; set; }
        public string? Supplier { get; set; }
        public bool IsActive { get; set; } = true;               // Soft delete flag
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Computed helpers
        public bool IsLowStock => Quantity <= MinQuantity;
        public decimal TotalValue => Price * Quantity;

        // Navigation
        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    }
}
