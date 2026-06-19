using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Common;

namespace InventoryManagement.Application.Services
{
    public interface ILookupService
    {
        Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync();
        Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto);
        Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(int id, UpdateCategoryDto dto);
        Task<ApiResponse<bool>> DeleteCategoryAsync(int id);

        Task<ApiResponse<List<BrandDto>>> GetBrandsAsync();
        Task<ApiResponse<BrandDto>> CreateBrandAsync(CreateBrandDto dto);
        Task<ApiResponse<BrandDto>> UpdateBrandAsync(int id, UpdateBrandDto dto);
        Task<ApiResponse<bool>> DeleteBrandAsync(int id);

        Task<ApiResponse<List<UnitDto>>> GetUnitsAsync();
        Task<ApiResponse<UnitDto>> CreateUnitAsync(CreateUnitDto dto);
        Task<ApiResponse<UnitDto>> UpdateUnitAsync(int id, UpdateUnitDto dto);
        Task<ApiResponse<bool>> DeleteUnitAsync(int id);

        Task<ApiResponse<List<WarehouseDto>>> GetWarehousesAsync();
        Task<ApiResponse<WarehouseDto>> CreateWarehouseAsync(CreateWarehouseDto dto);
        Task<ApiResponse<WarehouseDto>> UpdateWarehouseAsync(int id, UpdateWarehouseDto dto);
        Task<ApiResponse<bool>> DeleteWarehouseAsync(int id);
    }
}

