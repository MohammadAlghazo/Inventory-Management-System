using InventoryManagement.Application.Dtos;
using InventoryManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using InventoryManagement.Domain.Constants;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? search = null)
        {
            var result = await _customerService.GetAllCustomersAsync(page, pageSize, search);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _customerService.GetCustomerByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        [Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.Sales)]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            var result = await _customerService.CreateCustomerAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.Sales)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto)
        {
            var result = await _customerService.UpdateCustomerAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = RoleConstants.AdminOrManager)] 
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _customerService.DeleteCustomerAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}

