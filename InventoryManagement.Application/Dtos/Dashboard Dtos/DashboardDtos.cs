namespace InventoryManagement.Application.Dtos.Dashboard_Dtos
{
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int LowStockCount { get; set; }
        public int OutOfStockCount { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public int TodayMovements { get; set; }
        public int TotalUsers { get; set; }
        public int TotalCategories { get; set; }
    }

    public class ActivityChartDto
    {
        public string Date { get; set; } = string.Empty;    
        public int AddCount { get; set; }
        public int SellCount { get; set; }
        public int AdjustCount { get; set; }
        public int TotalMovements { get; set; }
    }

    public class CategoryBreakdownDto
    {
        public string Category { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public decimal TotalValue { get; set; }
        public int TotalQuantity { get; set; }
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public int TotalMovements { get; set; }
        public int CurrentQuantity { get; set; }
    }
}
