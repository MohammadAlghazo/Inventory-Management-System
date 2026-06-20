namespace InventoryManagement.Application.Dtos
{
    public class LowStockAlertDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public int CurrentQuantity { get; set; }
        public int MinQuantity { get; set; }
    }

    public class ValuationReportDto
    {
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public decimal TotalValue { get; set; }
        public int TotalItems { get; set; }
    }

    public class AbcAnalysisDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal TotalValue { get; set; }
        public string Classification { get; set; } = string.Empty; // A, B, or C
        public decimal CumulativeValuePercentage { get; set; }
    }
}
