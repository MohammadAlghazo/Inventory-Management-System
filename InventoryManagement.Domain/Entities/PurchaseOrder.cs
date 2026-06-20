using InventoryManagement.Domain.Enums;

namespace InventoryManagement.Domain.Entities
{
    public class PurchaseOrder
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        
        public int SupplierId { get; set; }
        public Supplier? Supplier { get; set; }
        
        public int WarehouseId { get; set; }
        public Warehouse? Warehouse { get; set; }
        
        public OrderStatus Status { get; set; } = OrderStatus.Draft;
        
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ExpectedDate { get; set; }
        
        public decimal TotalAmount { get; set; }
        
        public int? CreatedById { get; set; }
        public User? CreatedBy { get; set; }
        
        public ICollection<PurchaseOrderItem> Items { get; set; } = new List<PurchaseOrderItem>();
    }
}
