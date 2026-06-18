using Inventory_Management.Dtos;
using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // All customer endpoints require authentication
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _customerService.GetAllCustomersAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _customerService.GetCustomerByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
        {
            var result = await _customerService.CreateCustomerAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCustomerDto dto)
        {
            var result = await _customerService.UpdateCustomerAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Manager")] // Only managers can delete
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _customerService.DeleteCustomerAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
