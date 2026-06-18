namespace Inventory_Management.Models
{
    public enum InventoryAction
    {
        Add,      // إضافة للمخزون
        Sell,     // بيع
        Adjust,   // تعديل يدوي
        Return    // إرجاع بضاعة
    }

    public class InventoryLog
    {
        public int Id { get; set; }
        public InventoryAction Action { get; set; }
        public int QuantityChanged { get; set; }
        public int PreviousQuantity { get; set; }
        public int NewQuantity { get; set; }
        public string? Notes { get; set; }
        public DateTime ActionDate { get; set; } = DateTime.UtcNow;

        // Foreign Keys
        public int ProductId { get; set; }
        public int? UserId { get; set; }        // Who performed the action

        // Navigation Properties
        public Product Product { get; set; } = null!;
        public User? User { get; set; }
    }
}
