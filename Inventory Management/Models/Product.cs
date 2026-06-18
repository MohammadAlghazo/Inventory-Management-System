namespace Inventory_Management.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QRCode { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal Price { get; set; } // Selling Price
        public decimal Tax { get; set; } // Percentage or flat amount

        public int Quantity { get; set; }
        public int MinQuantity { get; set; }

        // Advanced Details
        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Manufacturer { get; set; }
        
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        
        // Expiry & Batch
        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Keys & Navigation
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public int? BrandId { get; set; }
        public Brand? Brand { get; set; }

        public int? UnitId { get; set; }
        public Unit? Unit { get; set; }

        public int? SupplierId { get; set; }
        public Supplier? Supplier { get; set; }

        // Computed helpers
        public bool IsLowStock => Quantity <= MinQuantity;
        public decimal TotalValue => Price * Quantity;

        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
    }
}
