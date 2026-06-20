namespace InventoryManagement.Domain.Entities
{
    public class ActivityLog
    {
        public int Id { get; set; }
        
        public int? UserId { get; set; }
        public User? User { get; set; }
        
        public string Action { get; set; } = string.Empty; 
        public string Module { get; set; } = string.Empty; 
        public string Details { get; set; } = string.Empty; 
        public string? IpAddress { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
