using Inventory_Management._DbContext;
using Inventory_Management.Dtos.Inventory_Dtos;
using Inventory_Management.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("AddItem")]
        [Authorize(Roles = "Manager,Employee")]
        public IActionResult AddItem([FromBody] AddInventoryDto dto)
        {
            try {

                var product = _context.Products.FirstOrDefault(p => p.Id == dto.ProductId);

                if (product == null)
                {
                    return NotFound("Product Not Found");
                }

                product.Quantity += dto.QuantityToAdd;

                _context.InventoryLogs.Add(new InventoryLog
                {
                    ProductId = product.Id,
                    Action = "Add",
                    QuantityChanged = dto.QuantityToAdd,
                    ActionDate = DateTime.Now
                });

                _context.SaveChanges();

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("SellProduct")]
        [Authorize(Roles = "Manager,Employee")]
        public IActionResult SellProduct([FromBody] SellProductDto dto)
        {
            try
            {
                var product = _context.Products.FirstOrDefault(p => p.Id == dto.ProductId);

                if (product == null)
                {
                    return NotFound("Product Not Found");
                }

                if (product.Quantity < dto.QuantityToSell)
                {
                    return BadRequest("Not enough stock to sell");
                }
                product.Quantity -= dto.QuantityToSell;

                _context.InventoryLogs.Add(new InventoryLog
                {
                    ProductId = product.Id,
                    Action = "Sell",
                    QuantityChanged = dto.QuantityToSell,
                    ActionDate = DateTime.Now
                });

                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("logs/{productId}")]
        [Authorize(Roles = "Manager,Employee")]
        public IActionResult GetLogs(int productId)
        {
            try
            {
                var logs = from log in _context.InventoryLogs
                           join product in _context.Products
                           on log.ProductId equals product.Id
                           where log.ProductId == productId
                           orderby log.ActionDate descending
                           select new InventoryLogDto
                           {
                               Id = log.Id,
                               ProductId = log.ProductId,
                               ProductName = product.Name,
                               Action = log.Action,
                               QuantityChanged = log.QuantityChanged,
                               ActionDate = log.ActionDate
                           };

                return Ok(logs.ToList());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
