using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Application.Services;
using InventoryManagement.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        [HttpGet("low-stock")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<List<LowStockAlertDto>>>> GetLowStockAlerts()
        {
            var data = await _reportService.GetLowStockAlertsAsync();
            return Ok(ApiResponse<List<LowStockAlertDto>>.Ok(data));
        }

        [HttpGet("valuation")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<List<ValuationReportDto>>>> GetValuation()
        {
            var data = await _reportService.GetInventoryValuationAsync();
            return Ok(ApiResponse<List<ValuationReportDto>>.Ok(data));
        }

        [HttpGet("abc-analysis")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<List<AbcAnalysisDto>>>> GetAbcAnalysis()
        {
            var data = await _reportService.GetAbcAnalysisAsync();
            return Ok(ApiResponse<List<AbcAnalysisDto>>.Ok(data));
        }
    }
}
