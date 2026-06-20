namespace InventoryManagement.Domain.Entities
{
    public class SalesOrderItem
    {
        public int Id { get; set; }
        
        public int SalesOrderId { get; set; }
        public SalesOrder? SalesOrder { get; set; }
        
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        public int Quantity { get; set; }
        
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }
}
