using System.Collections.Generic;
using System.Threading.Tasks;
using Inventory_Management.Dtos;
using Inventory_Management.Common;

namespace Inventory_Management.Services
{
    public interface ILookupService
    {
        Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync();
        Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto);

        Task<ApiResponse<List<BrandDto>>> GetBrandsAsync();
        Task<ApiResponse<BrandDto>> CreateBrandAsync(CreateBrandDto dto);

        Task<ApiResponse<List<UnitDto>>> GetUnitsAsync();
        Task<ApiResponse<UnitDto>> CreateUnitAsync(CreateUnitDto dto);

        Task<ApiResponse<List<WarehouseDto>>> GetWarehousesAsync();
        Task<ApiResponse<WarehouseDto>> CreateWarehouseAsync(CreateWarehouseDto dto);
    }
}
