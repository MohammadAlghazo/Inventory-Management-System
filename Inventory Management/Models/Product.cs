namespace Inventory_Management.Models
{
    public class Product
    {
        public int Id { get; set; } 
        public string? Name { get; set; }
        public decimal? Price { get; set; }
        public int? Quantity { get; set; } 
        public int? MinQuantity { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    }
}
