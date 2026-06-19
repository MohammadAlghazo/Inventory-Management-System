using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Inventory_Management._DbContext;
using Inventory_Management.Dtos;
using Inventory_Management.Models;
using Inventory_Management.Common;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public class LookupService : ILookupService
    {
        private readonly AppDbContext _db;

        public LookupService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync()
        {
            var categories = await _db.Categories
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryId
                }).ToListAsync();
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
            _db.Categories.Add(category);
            await _db.SaveChangesAsync();

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
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return ApiResponse<CategoryDto>.NotFound("Category not found");

            category.Name = dto.Name;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;
            
            await _db.SaveChangesAsync();

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
            var category = await _db.Categories.FindAsync(id);
            if (category == null) return ApiResponse<bool>.NotFound("Category not found");

            _db.Categories.Remove(category);
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Category deleted successfully");
        }

        public async Task<ApiResponse<List<BrandDto>>> GetBrandsAsync()
        {
            var brands = await _db.Brands
                .Select(b => new BrandDto
                {
                    Id = b.Id,
                    Name = b.Name,
                    Description = b.Description
                }).ToListAsync();
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
            _db.Brands.Add(brand);
            await _db.SaveChangesAsync();

            return ApiResponse<BrandDto>.Ok(new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description
            }, "Brand created successfully");
        }

        public async Task<ApiResponse<BrandDto>> UpdateBrandAsync(int id, UpdateBrandDto dto)
        {
            var brand = await _db.Brands.FindAsync(id);
            if (brand == null) return ApiResponse<BrandDto>.NotFound("Brand not found");

            brand.Name = dto.Name;
            brand.Description = dto.Description;
            
            await _db.SaveChangesAsync();

            return ApiResponse<BrandDto>.Ok(new BrandDto
            {
                Id = brand.Id,
                Name = brand.Name,
                Description = brand.Description
            }, "Brand updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteBrandAsync(int id)
        {
            var brand = await _db.Brands.FindAsync(id);
            if (brand == null) return ApiResponse<bool>.NotFound("Brand not found");

            _db.Brands.Remove(brand);
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Brand deleted successfully");
        }

        public async Task<ApiResponse<List<UnitDto>>> GetUnitsAsync()
        {
            var units = await _db.Units
                .Select(u => new UnitDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Abbreviation = u.Abbreviation
                }).ToListAsync();
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
            _db.Units.Add(unit);
            await _db.SaveChangesAsync();

            return ApiResponse<UnitDto>.Ok(new UnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                Abbreviation = unit.Abbreviation
            }, "Unit created successfully");
        }

        public async Task<ApiResponse<UnitDto>> UpdateUnitAsync(int id, UpdateUnitDto dto)
        {
            var unit = await _db.Units.FindAsync(id);
            if (unit == null) return ApiResponse<UnitDto>.NotFound("Unit not found");

            unit.Name = dto.Name;
            unit.Abbreviation = dto.Abbreviation;
            
            await _db.SaveChangesAsync();

            return ApiResponse<UnitDto>.Ok(new UnitDto
            {
                Id = unit.Id,
                Name = unit.Name,
                Abbreviation = unit.Abbreviation
            }, "Unit updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteUnitAsync(int id)
        {
            var unit = await _db.Units.FindAsync(id);
            if (unit == null) return ApiResponse<bool>.NotFound("Unit not found");

            _db.Units.Remove(unit);
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Unit deleted successfully");
        }

        public async Task<ApiResponse<List<WarehouseDto>>> GetWarehousesAsync()
        {
            var warehouses = await _db.Warehouses
                .Select(w => new WarehouseDto
                {
                    Id = w.Id,
                    Name = w.Name,
                    Location = w.Location,
                    ManagerName = w.ManagerName,
                    Capacity = w.Capacity,
                    IsActive = w.IsActive
                }).ToListAsync();
            return ApiResponse<List<WarehouseDto>>.Ok(warehouses);
        }

        public async Task<ApiResponse<WarehouseDto>> CreateWarehouseAsync(CreateWarehouseDto dto)
        {
            var warehouse = new Warehouse
            {
                Name = dto.Name,
                Location = dto.Location,
                ManagerName = dto.ManagerName,
                Capacity = dto.Capacity,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };
            _db.Warehouses.Add(warehouse);
            await _db.SaveChangesAsync();

            return ApiResponse<WarehouseDto>.Ok(new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Location = warehouse.Location,
                ManagerName = warehouse.ManagerName,
                Capacity = warehouse.Capacity,
                IsActive = warehouse.IsActive
            }, "Warehouse created successfully");
        }

        public async Task<ApiResponse<WarehouseDto>> UpdateWarehouseAsync(int id, UpdateWarehouseDto dto)
        {
            var warehouse = await _db.Warehouses.FindAsync(id);
            if (warehouse == null) return ApiResponse<WarehouseDto>.NotFound("Warehouse not found");

            warehouse.Name = dto.Name;
            warehouse.Location = dto.Location;
            warehouse.ManagerName = dto.ManagerName;
            warehouse.Capacity = dto.Capacity;
            warehouse.IsActive = dto.IsActive;
            
            await _db.SaveChangesAsync();

            return ApiResponse<WarehouseDto>.Ok(new WarehouseDto
            {
                Id = warehouse.Id,
                Name = warehouse.Name,
                Location = warehouse.Location,
                ManagerName = warehouse.ManagerName,
                Capacity = warehouse.Capacity,
                IsActive = warehouse.IsActive
            }, "Warehouse updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteWarehouseAsync(int id)
        {
            var warehouse = await _db.Warehouses.FindAsync(id);
            if (warehouse == null) return ApiResponse<bool>.NotFound("Warehouse not found");

            _db.Warehouses.Remove(warehouse);
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Warehouse deleted successfully");
        }
    }
}
