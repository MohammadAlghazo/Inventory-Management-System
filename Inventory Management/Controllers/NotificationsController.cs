using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using InventoryManagement.Infrastructure.Data;
using InventoryManagement.Domain.Common;
using InventoryManagement.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public NotificationsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var query = _db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50);

            var items = await query.ToListAsync();
            return Ok(new ApiResponse<System.Collections.Generic.List<Notification>>
            {
                Success = true,
                StatusCode = 200,
                Data = items,
                Message = "Notifications retrieved successfully"
            });
        }

        [HttpPost("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var notif = await _db.Notifications.FindAsync(id);
            if (notif == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, StatusCode = 404, Message = "Notification not found" });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId) || notif.UserId != userId)
            {
                return Forbid();
            }

            notif.IsRead = true;
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object> { Success = true, StatusCode = 200, Message = "Notification marked as read" });
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var unread = await _db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread)
            {
                n.IsRead = true;
            }

            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object> { Success = true, StatusCode = 200, Message = "All notifications marked as read" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var notif = await _db.Notifications.FindAsync(id);
            if (notif == null)
            {
                return NotFound(new ApiResponse<object> { Success = false, StatusCode = 404, Message = "Notification not found" });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId) || notif.UserId != userId)
            {
                return Forbid();
            }

            _db.Notifications.Remove(notif);
            await _db.SaveChangesAsync();

            return Ok(new ApiResponse<object> { Success = true, StatusCode = 200, Message = "Notification deleted" });
        }
    }
}
