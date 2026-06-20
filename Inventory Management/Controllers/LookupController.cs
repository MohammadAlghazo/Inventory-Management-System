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
    public class LookupController : ControllerBase
    {
        private readonly ILookupService _lookupService;

        public LookupController(ILookupService lookupService)
        {
            _lookupService = lookupService;
        }

        [HttpGet("categories")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories()
        {
            return Ok(await _lookupService.GetCategoriesAsync());
        }

        [HttpPost("categories")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(CreateCategoryDto dto)
        {
            return Ok(await _lookupService.CreateCategoryAsync(dto));
        }

        [HttpPut("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, UpdateCategoryDto dto)
        {
            return Ok(await _lookupService.UpdateCategoryAsync(id, dto));
        }

        [HttpDelete("categories/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(int id)
        {
            return Ok(await _lookupService.DeleteCategoryAsync(id));
        }

        [HttpGet("brands")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<BrandDto>>>> GetBrands()
        {
            return Ok(await _lookupService.GetBrandsAsync());
        }

        [HttpPost("brands")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<BrandDto>>> CreateBrand(CreateBrandDto dto)
        {
            return Ok(await _lookupService.CreateBrandAsync(dto));
        }

        [HttpPut("brands/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<BrandDto>>> UpdateBrand(int id, UpdateBrandDto dto)
        {
            return Ok(await _lookupService.UpdateBrandAsync(id, dto));
        }

        [HttpDelete("brands/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteBrand(int id)
        {
            return Ok(await _lookupService.DeleteBrandAsync(id));
        }

        [HttpGet("units")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<UnitDto>>>> GetUnits()
        {
            return Ok(await _lookupService.GetUnitsAsync());
        }

        [HttpPost("units")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<UnitDto>>> CreateUnit(CreateUnitDto dto)
        {
            return Ok(await _lookupService.CreateUnitAsync(dto));
        }

        [HttpPut("units/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<UnitDto>>> UpdateUnit(int id, UpdateUnitDto dto)
        {
            return Ok(await _lookupService.UpdateUnitAsync(id, dto));
        }

        [HttpDelete("units/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteUnit(int id)
        {
            return Ok(await _lookupService.DeleteUnitAsync(id));
        }

        [HttpGet("warehouses")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<List<WarehouseDto>>>> GetWarehouses()
        {
            return Ok(await _lookupService.GetWarehousesAsync());
        }

        [HttpPost("warehouses")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<WarehouseDto>>> CreateWarehouse(CreateWarehouseDto dto)
        {
            return Ok(await _lookupService.CreateWarehouseAsync(dto));
        }

        [HttpPut("warehouses/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<WarehouseDto>>> UpdateWarehouse(int id, UpdateWarehouseDto dto)
        {
            return Ok(await _lookupService.UpdateWarehouseAsync(id, dto));
        }

        [HttpDelete("warehouses/{id}")]
        [Authorize(Roles = "SuperAdmin,InventoryManager")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteWarehouse(int id)
        {
            return Ok(await _lookupService.DeleteWarehouseAsync(id));
        }
    }
}
