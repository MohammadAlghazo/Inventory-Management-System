using InventoryManagement.Application.Extensions;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Product_Dtos;
using InventoryManagement.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IAppDbContext _db;

        public ProductService(IAppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<PagedResult<ProductDto>>> GetAllAsync(ProductQueryParams query)
        {
            var q = _db.Products
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .AsQueryable();

            if (!query.IncludeInactive)
                q = q.Where(p => p.IsActive);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                q = q.Where(p =>
                    p.Name.Contains(query.Search) ||
                    p.SKU.Contains(query.Search) ||
                    p.Description.Contains(query.Search));
            }

            if (query.CategoryId.HasValue)
                q = q.Where(p => p.CategoryId == query.CategoryId.Value);

            if (query.MinPrice.HasValue)
                q = q.Where(p => p.Price >= query.MinPrice.Value);
            if (query.MaxPrice.HasValue)
                q = q.Where(p => p.Price <= query.MaxPrice.Value);

            if (query.IsLowStock.HasValue && query.IsLowStock.Value)
                q = q.Where(p => p.Quantity <= p.MinQuantity && p.Quantity > 0);

            if (!string.IsNullOrWhiteSpace(query.StockStatus))
            {
                if (query.StockStatus == "in-stock")
                    q = q.Where(p => p.Quantity > p.MinQuantity);
                else if (query.StockStatus == "low-stock")
                    q = q.Where(p => p.Quantity <= p.MinQuantity && p.Quantity > 0);
                else if (query.StockStatus == "out-of-stock")
                    q = q.Where(p => p.Quantity == 0);
            }

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
            var product = await _db.Products
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            return ApiResponse<ProductDto>.Ok(MapToDto(product));
        }

        public async Task<ApiResponse<ProductDto>> CreateAsync(CreateProductDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _db.Products.AnyAsync(p => p.SKU == dto.SKU && p.IsActive))
                return ApiResponse<ProductDto>.Fail($"A product with SKU '{dto.SKU}' already exists");

            var product = new Product
            {
                Name = dto.Name,
                SKU = dto.SKU,
                Barcode = dto.Barcode,
                QRCode = dto.QRCode,
                PurchasePrice = dto.PurchasePrice,
                Price = dto.Price,
                Tax = dto.Tax,
                Quantity = dto.Quantity,
                MinQuantity = dto.MinQuantity,
                Weight = dto.Weight,
                Color = dto.Color,
                Size = dto.Size,
                Manufacturer = dto.Manufacturer,
                CategoryId = dto.CategoryId,
                Description = dto.Description,
                UnitId = dto.UnitId,
                ImageUrl = dto.ImageUrl,
                SupplierId = dto.SupplierId,
                BrandId = dto.BrandId,
                ExpiryDate = dto.ExpiryDate,
                BatchNumber = dto.BatchNumber,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Products.Add(product);

            _db.AddNotification("Product Added", $"Product '{product.Name}' (SKU: {product.SKU}) has been registered.", "Success", "All");

            await _db.SaveChangesAsync();

            await _db.Entry(product).Reference(p => p.Category).LoadAsync();
            await _db.Entry(product).Reference(p => p.Unit).LoadAsync();
            await _db.Entry(product).Reference(p => p.Brand).LoadAsync();
            await _db.Entry(product).Reference(p => p.Supplier).LoadAsync();

            return ApiResponse<ProductDto>.Created(MapToDto(product), "Product created successfully");
        }

        public async Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _db.Products
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _db.Products.AnyAsync(p => p.SKU == dto.SKU && p.Id != id && p.IsActive))
                return ApiResponse<ProductDto>.Fail($"A product with SKU '{dto.SKU}' already exists");

            product.Name = dto.Name;
            product.SKU = dto.SKU;
            product.Barcode = dto.Barcode;
            product.QRCode = dto.QRCode;
            product.PurchasePrice = dto.PurchasePrice;
            product.Price = dto.Price;
            product.Tax = dto.Tax;
            product.Quantity = dto.Quantity;
            product.MinQuantity = dto.MinQuantity;
            product.Weight = dto.Weight;
            product.Color = dto.Color;
            product.Size = dto.Size;
            product.Manufacturer = dto.Manufacturer;
            product.CategoryId = dto.CategoryId;
            product.Description = dto.Description;
            product.UnitId = dto.UnitId;
            product.ImageUrl = dto.ImageUrl;
            product.SupplierId = dto.SupplierId;
            product.BrandId = dto.BrandId;
            product.ExpiryDate = dto.ExpiryDate;
            product.BatchNumber = dto.BatchNumber;
            product.UpdatedAt = DateTime.UtcNow;

            if (product.Quantity <= product.MinQuantity)
            {
                _db.AddNotification("Low Stock Alert", $"Product '{product.Name}' is low on stock! Remaining: {product.Quantity}.", "Warning", "All");
            }

            await _db.SaveChangesAsync();

            await _db.Entry(product).Reference(p => p.Category).LoadAsync();
            await _db.Entry(product).Reference(p => p.Unit).LoadAsync();
            await _db.Entry(product).Reference(p => p.Brand).LoadAsync();
            await _db.Entry(product).Reference(p => p.Supplier).LoadAsync();

            return ApiResponse<ProductDto>.Ok(MapToDto(product), "Product updated successfully");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound($"Product with ID {id} not found");

            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "Product deleted successfully");
        }

        public async Task<ApiResponse<List<ProductDto>>> GetLowStockAsync()
        {
            var products = await _db.Products
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Where(p => p.IsActive && p.Quantity <= p.MinQuantity)
                .OrderBy(p => p.Quantity)
                .Select(p => MapToDto(p))
                .ToListAsync();

            return ApiResponse<List<ProductDto>>.Ok(products);
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _db.Categories
                .Select(c => c.Name)
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
                TotalCategories = await _db.Categories.CountAsync()
            };

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }

        private static ProductDto MapToDto(Product p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            SKU = p.SKU,
            Barcode = p.Barcode,
            QRCode = p.QRCode,
            PurchasePrice = p.PurchasePrice,
            Price = p.Price,
            Tax = p.Tax,
            Quantity = p.Quantity,
            MinQuantity = p.MinQuantity,
            Weight = p.Weight,
            Color = p.Color,
            Size = p.Size,
            Manufacturer = p.Manufacturer,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name,
            Description = p.Description,
            UnitId = p.UnitId,
            UnitName = p.Unit?.Name,
            ImageUrl = p.ImageUrl,
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.Name,
            BrandId = p.BrandId,
            BrandName = p.Brand?.Name,
            ExpiryDate = p.ExpiryDate,
            BatchNumber = p.BatchNumber,
            IsLowStock = p.Quantity <= p.MinQuantity,
            TotalValue = p.Price * p.Quantity,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        };
    }
}

