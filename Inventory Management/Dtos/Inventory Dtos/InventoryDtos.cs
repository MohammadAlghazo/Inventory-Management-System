using Inventory_Management.Models;

namespace Inventory_Management.Dtos.Inventory_Dtos
{
    public class InventoryLogDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public int QuantityChanged { get; set; }
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public string? Notes { get; set; }
        public string? PerformedBy { get; set; }  
        public DateTime ActionDate { get; set; }
    }

    public class AddInventoryDto
    {
        public int ProductId { get; set; }
        public int QuantityToAdd { get; set; }
        public string? Notes { get; set; }
    }

    public class SellProductDto
    {
        public int ProductId { get; set; }
        public int QuantityToSell { get; set; }
        public string? Notes { get; set; }
    }

    public class AdjustStockDto
    {
        public int ProductId { get; set; }
        public int NewQuantity { get; set; }  
        public string? Notes { get; set; }
    }

    public class ReturnProductDto
    {
        public int ProductId { get; set; }
        public int QuantityToReturn { get; set; }
        public string? Notes { get; set; }
    }

    public class InventoryLogQueryParams
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public int? ProductId { get; set; }
        public string? Action { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string SortOrder { get; set; } = "desc";
    }
}
