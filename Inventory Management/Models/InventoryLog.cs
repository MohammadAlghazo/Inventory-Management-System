namespace Inventory_Management.Models
{
    public class InventoryLog
    {
        public int Id { get; set; } 
        public int ProductId { get; set; } 
        public string Action { get; set; } 
        public int QuantityChanged { get; set; } 
        public DateTime ActionDate { get; set; } 
    }
}
