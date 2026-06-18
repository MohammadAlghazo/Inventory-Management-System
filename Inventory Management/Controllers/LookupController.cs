using System.Collections.Generic;
using System.Threading.Tasks;
using Inventory_Management.Dtos;
using Inventory_Management.Services;
using Inventory_Management.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventory_Management.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LookupController : ControllerBase
    {
        private readonly ILookupService _lookupService;

        public LookupController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("categories")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories()
        {
            return Ok(await _lookupService.GetCategoriesAsync());
        }

        [HttpPost("categories")]
        [Authorize(Roles = "Manager")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(CreateCategoryDto dto)
        {
            return Ok(await _lookupService.CreateCategoryAsync(dto));
        }

        [HttpGet("brands")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<ActionResult<ApiResponse<List<BrandDto>>>> GetBrands()
        {
            return Ok(await _lookupService.GetBrandsAsync());
        }

        [HttpPost("brands")]
        [Authorize(Roles = "Manager")]
        public async Task<ActionResult<ApiResponse<BrandDto>>> CreateBrand(CreateBrandDto dto)
        {
            return Ok(await _lookupService.CreateBrandAsync(dto));
        }

        [HttpGet("units")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<ActionResult<ApiResponse<List<UnitDto>>>> GetUnits()
        {
            return Ok(await _lookupService.GetUnitsAsync());
        }

        [HttpPost("units")]
        [Authorize(Roles = "Manager")]
        public async Task<ActionResult<ApiResponse<UnitDto>>> CreateUnit(CreateUnitDto dto)
        {
            return Ok(await _lookupService.CreateUnitAsync(dto));
        }

        [HttpGet("warehouses")]
        [Authorize(Roles = "Manager,Employee")]
        public async Task<ActionResult<ApiResponse<List<WarehouseDto>>>> GetWarehouses()
        {
            return Ok(await _lookupService.GetWarehousesAsync());
        }

        [HttpPost("warehouses")]
        [Authorize(Roles = "Manager")]
        public async Task<ActionResult<ApiResponse<WarehouseDto>>> CreateWarehouse(CreateWarehouseDto dto)
        {
            return Ok(await _lookupService.CreateWarehouseAsync(dto));
        }
    }
}
