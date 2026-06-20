using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Application.Dtos
{
    public class PurchaseOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public OrderStatus StatusCode { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CreatedByName { get; set; }
        
        public List<PurchaseOrderItemDto> Items { get; set; } = new();
    }

    public class PurchaseOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public int QuantityOrdered { get; set; }
        public int QuantityReceived { get; set; }
        public decimal UnitCost { get; set; }
        public decimal TotalCost { get; set; }
    }

    public class CreatePurchaseOrderDto
    {
        public int SupplierId { get; set; }
        public int WarehouseId { get; set; }
        public DateTime? ExpectedDate { get; set; }
        public List<CreatePurchaseOrderItemDto> Items { get; set; } = new();
    }

    public class CreatePurchaseOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitCost { get; set; }
    }

    public class ReceivePurchaseOrderDto
    {
        public int PurchaseOrderId { get; set; }
        public string Notes { get; set; } = string.Empty;
    }
}
