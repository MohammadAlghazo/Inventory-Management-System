using System;

namespace Inventory_Management.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; } // The specific user this notification belongs to
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info"; 
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User User { get; set; }
    }
}
