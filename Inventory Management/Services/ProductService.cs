using Inventory_Management._DbContext;
using Inventory_Management.Common;
using Inventory_Management.Dtos.Product_Dtos;
using Inventory_Management.Models;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _db;

        public ProductService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<PagedResult<ProductDto>>> GetAllAsync(ProductQueryParams query)
        {
            var q = _db.Products.AsQueryable();

            // Filter inactive
            if (!query.IncludeInactive)
                q = q.Where(p => p.IsActive);

            // Search
            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var search = query.Search.ToLower();
                q = q.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    p.SKU.ToLower().Contains(search) ||
                    p.Description.ToLower().Contains(search) ||
                    p.Category.ToLower().Contains(search));
            }

            // Category filter
            if (!string.IsNullOrWhiteSpace(query.Category))
                q = q.Where(p => p.Category.ToLower() == query.Category.ToLower());

            // Price filter
            if (query.MinPrice.HasValue)
                q = q.Where(p => p.Price >= query.MinPrice.Value);
            if (query.MaxPrice.HasValue)
                q = q.Where(p => p.Price <= query.MaxPrice.Value);

            // Low stock filter
            if (query.IsLowStock.HasValue && query.IsLowStock.Value)
                q = q.Where(p => p.Quantity <= p.MinQuantity);

            // Sort
            q = (query.SortBy.ToLower(), query.SortOrder.ToLower()) switch
            {
                ("price", "asc") => q.OrderBy(p => p.Price),
                ("price", "desc") => q.OrderByDescending(p => p.Price),
                ("quantity", "asc") => q.OrderBy(p => p.Quantity),
                ("quantity", "desc") => q.OrderByDescending(p => p.Quantity),
                ("createdat", "desc") => q.OrderByDescending(p => p.CreatedAt),
                ("createdat", "asc") => q.OrderBy(p => p.CreatedAt),
                (_, "desc") => q.OrderByDescending(p => p.Name),
                _ => q.OrderBy(p => p.Name)
            };

            var totalCount = await q.CountAsync();

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(p => MapToDto(p))
                .ToListAsync();

            return ApiResponse<PagedResult<ProductDto>>.Ok(new PagedResult<ProductDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<ApiResponse<ProductDto>> GetByIdAsync(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            return ApiResponse<ProductDto>.Ok(MapToDto(product));
        }

        public async Task<ApiResponse<ProductDto>> CreateAsync(CreateProductDto dto)
        {
            // Check duplicate SKU
            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _db.Products.AnyAsync(p => p.SKU == dto.SKU && p.IsActive))
                return ApiResponse<ProductDto>.Fail($"A product with SKU '{dto.SKU}' already exists");

            var product = new Product
            {
                Name = dto.Name,
                SKU = dto.SKU,
                Price = dto.Price,
                Quantity = dto.Quantity,
                MinQuantity = dto.MinQuantity,
                Category = dto.Category,
                Description = dto.Description,
                Unit = dto.Unit,
                ImageUrl = dto.ImageUrl,
                Supplier = dto.Supplier,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            return ApiResponse<ProductDto>.Created(MapToDto(product), "Product created successfully");
        }

        public async Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            // Check duplicate SKU (excluding self)
            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _db.Products.AnyAsync(p => p.SKU == dto.SKU && p.Id != id && p.IsActive))
                return ApiResponse<ProductDto>.Fail($"A product with SKU '{dto.SKU}' already exists");

            product.Name = dto.Name;
            product.SKU = dto.SKU;
            product.Price = dto.Price;
            product.Quantity = dto.Quantity;
            product.MinQuantity = dto.MinQuantity;
            product.Category = dto.Category;
            product.Description = dto.Description;
            product.Unit = dto.Unit;
            product.ImageUrl = dto.ImageUrl;
            product.Supplier = dto.Supplier;
            product.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return ApiResponse<ProductDto>.Ok(MapToDto(product), "Product updated successfully");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound($"Product with ID {id} not found");

            // Soft delete
            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "Product deleted successfully");
        }

        public async Task<ApiResponse<List<ProductDto>>> GetLowStockAsync()
        {
            var products = await _db.Products
                .Where(p => p.IsActive && p.Quantity <= p.MinQuantity)
                .OrderBy(p => p.Quantity)
                .Select(p => MapToDto(p))
                .ToListAsync();

            return ApiResponse<List<ProductDto>>.Ok(products);
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _db.Products
                .Where(p => p.IsActive)
                .Select(p => p.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return ApiResponse<List<string>>.Ok(categories);
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync()
        {
            var today = DateTime.UtcNow.Date;

            var stats = new DashboardStatsDto
            {
                TotalProducts = await _db.Products.CountAsync(p => p.IsActive),
                LowStockCount = await _db.Products.CountAsync(p => p.IsActive && p.Quantity <= p.MinQuantity && p.Quantity > 0),
                OutOfStockCount = await _db.Products.CountAsync(p => p.IsActive && p.Quantity == 0),
                TotalInventoryValue = await _db.Products.Where(p => p.IsActive).SumAsync(p => p.Price * p.Quantity),
                TodayMovements = await _db.InventoryLogs.CountAsync(l => l.ActionDate.Date == today),
                TotalCategories = await _db.Products.Where(p => p.IsActive).Select(p => p.Category).Distinct().CountAsync()
            };

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }

        // ── Mapping ─────────────────────────────────────────────────────
        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Price = p.Price,
            Quantity = p.Quantity,
            MinQuantity = p.MinQuantity,
            Category = p.Category,
            Description = p.Description,
            Unit = p.Unit,
            ImageUrl = p.ImageUrl,
            Supplier = p.Supplier,
            IsLowStock = p.Quantity <= p.MinQuantity,
            TotalValue = p.Price * p.Quantity,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}
