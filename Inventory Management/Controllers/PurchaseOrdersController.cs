using InventoryManagement.Application.Dtos;
using InventoryManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,InventoryManager,PurchasingOfficer,WarehouseStaff")]
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;

        public PurchaseOrdersController(IPurchaseOrderService purchaseOrderService)
        {
            _purchaseOrderService = purchaseOrderService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var result = await _purchaseOrderService.GetPurchaseOrdersAsync(page, pageSize, search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
            if (!response.Success)
                return NotFound(response);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var response = await _purchaseOrderService.CreatePurchaseOrderAsync(dto, userId);
            if (!response.Success)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        [HttpPost("{id}/receive")]
        public async Task<IActionResult> Receive(int id, [FromBody] ReceivePurchaseOrderDto dto)
        {
            if (id != dto.PurchaseOrderId)
                return BadRequest("ID mismatch");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var response = await _purchaseOrderService.ReceivePurchaseOrderAsync(id, userId);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}
