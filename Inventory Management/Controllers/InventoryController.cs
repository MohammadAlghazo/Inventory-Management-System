using Inventory_Management.Dtos.Inventory_Dtos;
using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inventory_Management.Controllers
{
    [Route("api/inventory")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        private int GetCurrentUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet("logs")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetAllLogs([FromQuery] InventoryLogQueryParams query)
        {
            var result = await _inventoryService.GetAllLogsAsync(query);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("logs/product/{productId:int}")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetLogsByProduct(int productId)
        {
            var result = await _inventoryService.GetLogsByProductAsync(productId);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("add")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> AddItem([FromBody] AddInventoryDto dto)
        {
            var result = await _inventoryService.AddItemAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("sell")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> Sell([FromBody] SellProductDto dto)
        {
            var result = await _inventoryService.SellProductAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("adjust")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Adjust([FromBody] AdjustStockDto dto)
        {
            var result = await _inventoryService.AdjustStockAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost("return")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> Return([FromBody] ReturnProductDto dto)
        {
            var result = await _inventoryService.ReturnProductAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }
    }
}
