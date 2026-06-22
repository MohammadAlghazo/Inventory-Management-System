using InventoryManagement.Application.DTOs.Ai_Dtos;
using InventoryManagement.Domain.Enums;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InventoryManagement.Application.Interfaces
{
    public interface IAiService
    {
        Task<AiResponseDto> ChatAsync(
            string message,
            int? currentUserId = null,
            string userRole = "Staff",
            AiMode mode = AiMode.Normal,
            List<ChatMessageDto>? history = null);
    }
}
