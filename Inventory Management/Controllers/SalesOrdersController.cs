using InventoryManagement.Application.Dtos;
using InventoryManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using InventoryManagement.Domain.Constants;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.Sales + "," + RoleConstants.WarehouseStaff)]
    public class SalesOrdersController : ControllerBase
    {
        private readonly ISalesOrderService _salesOrderService;

        public SalesOrdersController(ISalesOrderService salesOrderService)
        {
            _salesOrderService = salesOrderService;
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var result = await _salesOrderService.GetSalesOrdersAsync(page, pageSize, search);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var response = await _salesOrderService.GetSalesOrderByIdAsync(id);
            if (!response.Success)
                return NotFound(response);
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSalesOrderDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var response = await _salesOrderService.CreateSalesOrderAsync(dto, userId);
            if (!response.Success)
                return BadRequest(response);

            return CreatedAtAction(nameof(GetById), new { id = response.Data?.Id }, response);
        }

        [HttpPost("{id}/ship")]
        public async Task<IActionResult> Ship(int id, [FromBody] ShipSalesOrderDto dto)
        {
            if (id != dto.SalesOrderId)
                return BadRequest("ID mismatch");

            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var response = await _salesOrderService.ShipSalesOrderAsync(dto, userId);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}

