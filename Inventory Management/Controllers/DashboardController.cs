using Inventory_Management.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    [Authorize(Roles = "Manager,Employee")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var result = await _dashboardService.GetStatsAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("activity-chart")]
        public async Task<IActionResult> GetActivityChart([FromQuery] int days = 30)
        {
            if (days < 7 || days > 365)
                return BadRequest(new { success = false, message = "Days must be between 7 and 365" });

            var result = await _dashboardService.GetActivityChartAsync(days);
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("category-breakdown")]
        public async Task<IActionResult> GetCategoryBreakdown()
        {
            var result = await _dashboardService.GetCategoryBreakdownAsync();
            return StatusCode(result.StatusCode, result);
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopProducts([FromQuery] int limit = 5)
        {
            if (limit < 1 || limit > 20)
                return BadRequest(new { success = false, message = "Limit must be between 1 and 20" });

            var result = await _dashboardService.GetTopProductsAsync(limit);
            return StatusCode(result.StatusCode, result);
        }
    }
}
