using System.Linq;

namespace InventoryManagement.Domain.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QRCode { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal Price { get; set; } 
        public decimal Tax { get; set; } 


        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Manufacturer { get; set; }
        
        public string Description { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public int? BrandId { get; set; }
        public Brand? Brand { get; set; }

        public int? UnitId { get; set; }
        public Unit? Unit { get; set; }

        public int? SupplierId { get; set; }
        public Supplier? Supplier { get; set; }

        public bool IsLowStock => ProductStocks?.Sum(s => s.Quantity) <= ProductStocks?.Sum(s => s.MinQuantity);
        public decimal TotalValue => Price * (ProductStocks?.Sum(s => s.Quantity) ?? 0);

        [System.ComponentModel.DataAnnotations.Timestamp]
        public byte[]? RowVersion { get; set; }

        public ICollection<InventoryLog> InventoryLogs { get; set; } = new List<InventoryLog>();
        public ICollection<ProductStock> ProductStocks { get; set; } = new List<ProductStock>();
    }
}
