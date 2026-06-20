using InventoryManagement.Application.Dtos.Product_Dtos;
using InventoryManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/products")]
    [ApiController]
    [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetAll([FromQuery] ProductQueryParams query)
        {
            var result = await _productService.GetAllAsync(query);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _productService.GetByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("categories")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _productService.GetCategoriesAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetLowStock()
        {
            var result = await _productService.GetLowStockAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpPost]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var result = await _productService.CreateAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            var result = await _productService.UpdateAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productService.DeleteAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}
