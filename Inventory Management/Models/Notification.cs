using System;

namespace Inventory_Management.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = "Info"; // "Info" | "Success" | "Warning" | "Danger"
        public string TargetRole { get; set; } = "All"; // "All" | "Manager" | "Employee"
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
