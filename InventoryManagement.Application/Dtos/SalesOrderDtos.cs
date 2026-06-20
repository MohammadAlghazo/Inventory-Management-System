using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Application.Dtos
{
    public class SalesOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public OrderStatus StatusCode { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ExpectedShipDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CreatedByName { get; set; }
        
        public List<SalesOrderItemDto> Items { get; set; } = new();
    }

    public class SalesOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductSKU { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }

    public class CreateSalesOrderDto
    {
        public int CustomerId { get; set; }
        public int WarehouseId { get; set; }
        public DateTime? ExpectedShipDate { get; set; }
        public List<CreateSalesOrderItemDto> Items { get; set; } = new();
    }

    public class CreateSalesOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
    }
    
    public class ShipSalesOrderDto
    {
        public int SalesOrderId { get; set; }
        public string TrackingNumber { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
    }
}
