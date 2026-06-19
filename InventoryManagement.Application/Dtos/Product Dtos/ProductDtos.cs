namespace InventoryManagement.Application.Dtos.Product_Dtos
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QRCode { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal Price { get; set; }
        public decimal Tax { get; set; }

        public int Quantity { get; set; }
        public int MinQuantity { get; set; }

        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Manufacturer { get; set; }

        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }
        
        public string Description { get; set; } = string.Empty;

        public int? UnitId { get; set; }
        public string? UnitName { get; set; }

        public string? ImageUrl { get; set; }

        public int? SupplierId { get; set; }
        public string? SupplierName { get; set; }

        public int? BrandId { get; set; }
        public string? BrandName { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }

        public bool IsLowStock { get; set; }
        public decimal TotalValue { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QRCode { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal Price { get; set; }
        public decimal Tax { get; set; }

        public int Quantity { get; set; }
        public int MinQuantity { get; set; }

        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Manufacturer { get; set; }

        public int? CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int? UnitId { get; set; }
        public string? ImageUrl { get; set; }
        public int? SupplierId { get; set; }
        public int? BrandId { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }
    }

    public class UpdateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public string? Barcode { get; set; }
        public string? QRCode { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal Price { get; set; }
        public decimal Tax { get; set; }

        public int Quantity { get; set; }
        public int MinQuantity { get; set; }

        public decimal? Weight { get; set; }
        public string? Color { get; set; }
        public string? Size { get; set; }
        public string? Manufacturer { get; set; }

        public int? CategoryId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int? UnitId { get; set; }
        public string? ImageUrl { get; set; }
        public int? SupplierId { get; set; }
        public int? BrandId { get; set; }

        public DateTime? ExpiryDate { get; set; }
        public string? BatchNumber { get; set; }
    }

    public class ProductQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? Search { get; set; }
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? IsLowStock { get; set; }
        public string? StockStatus { get; set; }
        public string SortBy { get; set; } = "name";
        public string SortOrder { get; set; } = "asc";
        public bool IncludeInactive { get; set; } = false;
    }

    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public int TodayMovements { get; set; }
        public int TotalCategories { get; set; }
    }
}
