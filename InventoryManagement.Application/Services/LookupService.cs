using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace InventoryManagement.Application.Services
{
    public class LookupService : ILookupService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMemoryCache _cache;
        
        private const string CategoriesCacheKey = "Lookup_Categories";
        private const string BrandsCacheKey = "Lookup_Brands";
        private const string UnitsCacheKey = "Lookup_Units";
        private const string WarehousesCacheKey = "Lookup_Warehouses";

        public LookupService(IUnitOfWork uow, IMemoryCache cache)
        {
            _uow = uow;
            _cache = cache;
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync()
        {
            if (_cache.TryGetValue(CategoriesCacheKey, out List<CategoryDto>? cached))
            {
                return ApiResponse<List<CategoryDto>>.Ok(cached!);
            }

            var categories = await _uow.Categories.Query()
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId
                }).ToListAsync();
                
            _cache.Set(CategoriesCacheKey, categories);
            return ApiResponse<List<CategoryDto>>.Ok(categories);
        }

        public async Task<ApiResponse<CategoryDto>> CreateCategoryAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description,
                ParentCategoryId = dto.ParentCategoryId,
                CreatedAt = DateTime.UtcNow
            };
            _uow.Categories.Add(category);
            await _uow.SaveChangesAsync();
            _cache.Remove(CategoriesCacheKey);

            return ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId
            }, "Category created successfully");
        }

        public async Task<ApiResponse<CategoryDto>> UpdateCategoryAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null) return ApiResponse<CategoryDto>.NotFound("Category not found");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;
            
            await _uow.SaveChangesAsync();
            _cache.Remove(CategoriesCacheKey);

            return ApiResponse<CategoryDto>.Ok(new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId
            }, "Category updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteCategoryAsync(int id)
        {
            var category = await _uow.Categories.GetByIdAsync(id);
            if (category == null) return ApiResponse<bool>.NotFound("Category not found");

            category.IsActive = false;
            await _uow.SaveChangesAsync();
            _cache.Remove(CategoriesCacheKey);

            return ApiResponse<bool>.Ok(true, "Category deleted successfully");
        }

        public async Task<ApiResponse<List<BrandDto>>> GetBrandsAsync()
        {
            if (_cache.TryGetValue(BrandsCacheKey, out List<BrandDto>? cached))
            {
                return ApiResponse<List<BrandDto>>.Ok(cached!);
            }

            var brands = await _uow.Brands.Query()
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Description = b.Description
                }).ToListAsync();

            _cache.Set(BrandsCacheKey, brands);
            return ApiResponse<List<BrandDto>>.Ok(brands);
        }

        public async Task<ApiResponse<BrandDto>> CreateBrandAsync(CreateBrandDto dto)
        {
            var brand = new Brand
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };
            _uow.Brands.Add(brand);
            await _uow.SaveChangesAsync();
            _cache.Remove(BrandsCacheKey);

            return ApiResponse<BrandDto>.Ok(new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description
            }, "Brand created successfully");
        }

        public async Task<ApiResponse<BrandDto>> UpdateBrandAsync(int id, UpdateBrandDto dto)
        {
            var brand = await _uow.Brands.GetByIdAsync(id);
            if (brand == null) return ApiResponse<BrandDto>.NotFound("Brand not found");

            brand.Name = dto.Name;
            brand.Description = dto.Description;
            
            await _uow.SaveChangesAsync();
            _cache.Remove(BrandsCacheKey);

            return ApiResponse<BrandDto>.Ok(new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description
            }, "Brand updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteBrandAsync(int id)
        {
            var brand = await _uow.Brands.GetByIdAsync(id);
            if (brand == null) return ApiResponse<bool>.NotFound("Brand not found");

            brand.IsActive = false;
            await _uow.SaveChangesAsync();
            _cache.Remove(BrandsCacheKey);

            return ApiResponse<bool>.Ok(true, "Brand deleted successfully");
        }

        public async Task<ApiResponse<List<UnitDto>>> GetUnitsAsync()
        {
            if (_cache.TryGetValue(UnitsCacheKey, out List<UnitDto>? cached))
            {
                return ApiResponse<List<UnitDto>>.Ok(cached!);
            }

            var units = await _uow.Units.Query()
                .Select(u => new UnitDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Abbreviation = u.Abbreviation
                }).ToListAsync();
                
            _cache.Set(UnitsCacheKey, units);
            return ApiResponse<List<UnitDto>>.Ok(units);
        }

        public async Task<ApiResponse<UnitDto>> CreateUnitAsync(CreateUnitDto dto)
        {
            var unit = new Unit
            {
                Name = dto.Name,
                Abbreviation = dto.Abbreviation,
                CreatedAt = DateTime.UtcNow
            };
            _uow.Units.Add(unit);
            await _uow.SaveChangesAsync();
            _cache.Remove(UnitsCacheKey);

            return ApiResponse<UnitDto>.Ok(new UnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                Abbreviation = unit.Abbreviation
            }, "Unit created successfully");
        }

        public async Task<ApiResponse<UnitDto>> UpdateUnitAsync(int id, UpdateUnitDto dto)
        {
            var unit = await _uow.Units.GetByIdAsync(id);
            if (unit == null) return ApiResponse<UnitDto>.NotFound("Unit not found");

            unit.Name = dto.Name;
            unit.Abbreviation = dto.Abbreviation;
            
            await _uow.SaveChangesAsync();
            _cache.Remove(UnitsCacheKey);

            return ApiResponse<UnitDto>.Ok(new UnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                Abbreviation = unit.Abbreviation
            }, "Unit updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteUnitAsync(int id)
        {
            var unit = await _uow.Units.GetByIdAsync(id);
            if (unit == null) return ApiResponse<bool>.NotFound("Unit not found");

            unit.IsActive = false;
            await _uow.SaveChangesAsync();
            _cache.Remove(UnitsCacheKey);

            return ApiResponse<bool>.Ok(true, "Unit deleted successfully");
        }

        public async Task<ApiResponse<List<WarehouseDto>>> GetWarehousesAsync()
        {
            if (_cache.TryGetValue(WarehousesCacheKey, out List<WarehouseDto>? cached))
            {
                return ApiResponse<List<WarehouseDto>>.Ok(cached!);
            }

            var warehouses = await _uow.Warehouses.Query()
                .Select(w => new WarehouseDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Location = w.Location,
                    ManagerName = w.ManagerName,
                    Capacity = w.Capacity,
                    IsActive = w.IsActive,
                    IsDefault = w.IsDefault
                }).ToListAsync();
                
            _cache.Set(WarehousesCacheKey, warehouses);
            return ApiResponse<List<WarehouseDto>>.Ok(warehouses);
        }

        public async Task<ApiResponse<WarehouseDto>> CreateWarehouseAsync(CreateWarehouseDto dto)
        {
            if (dto.IsDefault)
            {
                var otherDefaults = await _uow.Warehouses.Query().Where(w => w.IsDefault).ToListAsync();
                foreach (var w in otherDefaults)
                {
                    w.IsDefault = false;
                }
            }

            var warehouse = new Warehouse
            {
                Name = dto.Name,
                Location = dto.Location,
                ManagerName = dto.ManagerName,
                Capacity = dto.Capacity,
                IsActive = dto.IsActive,
                IsDefault = dto.IsDefault,
                CreatedAt = DateTime.UtcNow
            };
            _uow.Warehouses.Add(warehouse);
            await _uow.SaveChangesAsync();
            _cache.Remove(WarehousesCacheKey);

            return ApiResponse<WarehouseDto>.Ok(new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Location = warehouse.Location,
                ManagerName = warehouse.ManagerName,
                Capacity = warehouse.Capacity,
                IsActive = warehouse.IsActive,
                IsDefault = warehouse.IsDefault
            }, "Warehouse created successfully");
        }

        public async Task<ApiResponse<WarehouseDto>> UpdateWarehouseAsync(int id, UpdateWarehouseDto dto)
        {
            var warehouse = await _uow.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return ApiResponse<WarehouseDto>.NotFound("Warehouse not found");

            if (dto.IsDefault && !warehouse.IsDefault)
            {
                var otherDefaults = await _uow.Warehouses.Query().Where(w => w.IsDefault && w.Id != id).ToListAsync();
                foreach (var w in otherDefaults)
                {
                    w.IsDefault = false;
                }
            }

            warehouse.Name = dto.Name;
            warehouse.Location = dto.Location;
            warehouse.ManagerName = dto.ManagerName;
            warehouse.Capacity = dto.Capacity;
            warehouse.IsActive = dto.IsActive;
            warehouse.IsDefault = dto.IsDefault;
            
            await _uow.SaveChangesAsync();
            _cache.Remove(WarehousesCacheKey);

            return ApiResponse<WarehouseDto>.Ok(new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Location = warehouse.Location,
                ManagerName = warehouse.ManagerName,
                Capacity = warehouse.Capacity,
                IsActive = warehouse.IsActive,
                IsDefault = warehouse.IsDefault
            }, "Warehouse updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteWarehouseAsync(int id)
        {
            var warehouse = await _uow.Warehouses.GetByIdAsync(id);
            if (warehouse == null) return ApiResponse<bool>.NotFound("Warehouse not found");

            warehouse.IsActive = false;
            await _uow.SaveChangesAsync();
            _cache.Remove(WarehousesCacheKey);

            return ApiResponse<bool>.Ok(true, "Warehouse deleted successfully");
        }
    }
}

