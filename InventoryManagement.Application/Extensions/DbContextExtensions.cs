using InventoryManagement.Application.Common.Interfaces;
using System.Linq;

using InventoryManagement.Domain.Entities;

namespace InventoryManagement.Application.Extensions
{
    public static class DbContextExtensions
    {
        public static void AddNotification(this IAppDbContext db, string title, string message, string type, string targetRole = "All")
        {
            var users = db.Users.Where(u => targetRole == "All" || u.Role == targetRole).ToList();
            foreach (var u in users)
            {
                db.Notifications.Add(new Notification
                {
                    UserId = u.Id,
                    Title = title,
                    Message = message,
                    Type = type
                });
            }
        }
    }
}
