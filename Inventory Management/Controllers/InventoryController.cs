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

        /// <summary>Get all inventory movement logs with optional filters</summary>
        [HttpGet("logs")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetAllLogs([FromQuery] InventoryLogQueryParams query)
        {
            var result = await _inventoryService.GetAllLogsAsync(query);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get inventory movement logs for a specific product</summary>
        [HttpGet("logs/product/{productId:int}")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetLogsByProduct(int productId)
        {
            var result = await _inventoryService.GetLogsByProductAsync(productId);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Add stock to a product</summary>
        [HttpPost("add")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> AddItem([FromBody] AddInventoryDto dto)
        {
            var result = await _inventoryService.AddItemAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Sell / reduce stock for a product</summary>
        [HttpPost("sell")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> Sell([FromBody] SellProductDto dto)
        {
            var result = await _inventoryService.SellProductAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Manually adjust a product's stock to a specific value — Manager only</summary>
        [HttpPost("adjust")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Adjust([FromBody] AdjustStockDto dto)
        {
            var result = await _inventoryService.AdjustStockAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Return previously sold stock back to inventory</summary>
        [HttpPost("return")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> Return([FromBody] ReturnProductDto dto)
        {
            var result = await _inventoryService.ReturnProductAsync(dto, GetCurrentUserId());
            return StatusCode(result.StatusCode, result);
        }
    }
}
