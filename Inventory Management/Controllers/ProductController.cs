using Inventory_Management._DbContext;
using Inventory_Management.Dtos;
using Inventory_Management.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("GetAllProduct")]
        //[Authorize(Roles = "Manager,Employee")]
        [AllowAnonymous]
        public IActionResult GetAllProduct()
        {
            try
            {
                var product = _context.Products.Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    MinQuantity = p.MinQuantity,
                    Category = p.Category,
                    Description = p.Description
                }).ToList();

                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetById/{id}")]
        //[Authorize(Roles = "Manager,Employee")]
        public IActionResult GetById(long id)
        {
            try
            {
                if (id == 0) return BadRequest("Invalid Product Id");

                var product = _context.Products.Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    MinQuantity = p.MinQuantity,
                    Category = p.Category,
                    Description = p.Description
                }).FirstOrDefault(p => p.Id == id);

                if (product == null) return NotFound("Product not found");

                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("Add")]
        // [Authorize(Roles = "Manager")]
        public IActionResult Add([FromBody] CreateProductDto productDto)
        {
            try
            {
                var product = new Product()
                {
                    Id = 0,
                    Name = productDto.Name,
                    Price = productDto.Price,
                    Quantity = productDto.Quantity,
                    MinQuantity = productDto.minQuantity,
                    Category = productDto.Category,
                    Description = productDto.Description
                };
                _context.Products.Add(product);
                _context.SaveChanges();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("Update")]
        //[Authorize(Roles = "Manager,Employee")]
        public IActionResult Update([FromBody] UpdateProductDto productDto)
        {
            try
            {
                var product = _context.Products.FirstOrDefault(x => x.Id == productDto.Id);

                if (product == null) return NotFound("Product not found");

                product.Name = productDto.Name;
                product.Price = productDto.Price;
                product.MinQuantity = productDto.MinQuantity;
                product.Quantity = productDto.Quantity;

                product.Category = productDto.Category;
                product.Description = productDto.Description;

                _context.SaveChanges();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("Delete/{id}")]
        //[Authorize(Roles = "Manager")]
        public IActionResult Delete(long id)
        {
            try
            {
                var product = _context.Products.FirstOrDefault(x => x.Id == id);
                if (product == null) return NotFound("Product not found");

                _context.Products.Remove(product);
                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("LowStockProducts")]
        //[Authorize(Roles = "Manager,Employee")]
        public IActionResult LowStockProducts()
        {
            try
            {
                var lowStockProducts = _context.Products
                    .Where(p => p.Quantity <= p.MinQuantity)
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        Quantity = p.Quantity,
                        MinQuantity = p.MinQuantity,
                        Category = p.Category,
                        Description = p.Description
                    })
                    .ToList();
                return Ok(lowStockProducts);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}