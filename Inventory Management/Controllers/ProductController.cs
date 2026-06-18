using Inventory_Management.Dtos.Product_Dtos;
using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
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

        /// <summary>Get all products with pagination, search, filter, and sort</summary>
        [HttpGet]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetAll([FromQuery] ProductQueryParams query)
        {
            var result = await _productService.GetAllAsync(query);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get a single product by ID</summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _productService.GetByIdAsync(id);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get list of all unique categories</summary>
        [HttpGet("categories")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetCategories()
        {
            var result = await _productService.GetCategoriesAsync();
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Get products below minimum stock level</summary>
        [HttpGet("low-stock")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<IActionResult> GetLowStock()
        {
            var result = await _productService.GetLowStockAsync();
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Create a new product — Manager only</summary>
        [HttpPost]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
        {
            var result = await _productService.CreateAsync(dto);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Update an existing product — Manager only</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProductDto dto)
        {
            var result = await _productService.UpdateAsync(id, dto);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>Soft-delete a product — Manager only</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _productService.DeleteAsync(id);
            return StatusCode(result.StatusCode, result);
        }
    }
}