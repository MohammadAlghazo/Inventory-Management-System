using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Domain.Entities
{
    public class SalesOrder
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }
        
        public int WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.Draft;
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ExpectedShipDate { get; set; }
        
        public decimal TotalAmount { get; set; }
        
        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        
        public ICollection<SalesOrderItem> Items { get; set; } = new List<SalesOrderItem>();
    }
}
