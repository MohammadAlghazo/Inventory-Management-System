using InventoryManagement.Application.Dtos;
using InventoryManagement.Application.Services;
using InventoryManagement.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers
{
    [Route("api/audit")]
    [ApiController]
    [Authorize(Roles = RoleConstants.SuperAdmin)]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs([FromQuery] AuditLogQueryParams query)
        {
            var result = await _auditService.GetAuditLogsAsync(query);
            return StatusCode(result.StatusCode, result);
        }
    }
}
