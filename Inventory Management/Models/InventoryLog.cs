namespace Inventory_Management.Models
{
    public class InventoryLog
    {
        public int Id { get; set; } 
        
        public string Action { get; set; } 
        public int QuantityChanged { get; set; } 
        public DateTime ActionDate { get; set; }
        public int ProductId { get; set; } // Foreign Key
        public Product Product { get; set; } // Navigation Property

    }
}
