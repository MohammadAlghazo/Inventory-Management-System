using InventoryManagement.Application.DTOs.Ai_Dtos;
using InventoryManagement.Application.Interfaces;
using InventoryManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiService _aiService;

        public AiController(IAiService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("chat")]
        public async Task<ActionResult<AiResponseDto>> Chat([FromBody] ChatRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var id) ? id : null;

            // Assume the role is stored in a claim named "role" or ClaimTypes.Role
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value ?? "Staff";

            var response = await _aiService.ChatAsync(
                request.Message,
                userId,
                roleClaim,
                request.Mode,
                request.History
            );

            return Ok(response);
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public AiMode Mode { get; set; } = AiMode.Normal;
        public List<ChatMessageDto>? History { get; set; }
    }
}
