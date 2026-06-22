using InventoryManagement.Application.Extensions;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Product_Dtos;
using InventoryManagement.Domain.Entities;

using Microsoft.EntityFrameworkCore;

using InventoryManagement.Application.Dtos.Dashboard_Dtos;

namespace InventoryManagement.Application.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _uow;

        public ProductService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<PagedResult<ProductDto>>> GetAllAsync(ProductQueryParams query)
        {
            var q = _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
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
                q = q.Where(p => p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity) && p.ProductStocks.Sum(s => s.Quantity) > 0);

            if (!string.IsNullOrWhiteSpace(query.StockStatus))
            {
                if (query.StockStatus == "in-stock")
                    q = q.Where(p => p.ProductStocks.Sum(s => s.Quantity) > p.ProductStocks.Sum(s => s.MinQuantity));
                else if (query.StockStatus == "low-stock")
                    q = q.Where(p => p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity) && p.ProductStocks.Sum(s => s.Quantity) > 0);
                else if (query.StockStatus == "out-of-stock")
                    q = q.Where(p => p.ProductStocks.Sum(s => s.Quantity) == 0);
            }

            q = (query.SortBy.ToLower(), query.SortOrder.ToLower()) switch
            {
                ("price", "asc") => q.OrderBy(p => p.Price),
                ("price", "desc") => q.OrderByDescending(p => p.Price),
                ("quantity", "asc") => q.OrderBy(p => p.ProductStocks.Sum(s => s.Quantity)),
                ("quantity", "desc") => q.OrderByDescending(p => p.ProductStocks.Sum(s => s.Quantity)),
                ("createdat", "desc") => q.OrderByDescending(p => p.CreatedAt),
                ("createdat", "asc") => q.OrderBy(p => p.CreatedAt),
                (_, "desc") => q.OrderByDescending(p => p.Name),
                _ => q.OrderBy(p => p.Name)
            };

            var totalCount = await q.CountAsync();
            var clampedPageSize = Math.Min(query.PageSize, 100);

            var items = await q
                .Skip((query.Page - 1) * clampedPageSize)
                .Take(clampedPageSize)
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
            var product = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            return ApiResponse<ProductDto>.Ok(MapToDto(product));
        }

        public async Task<ApiResponse<ProductDto>> CreateAsync(CreateProductDto dto)
        {
            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _uow.Products.AnyAsync(p => p.SKU == dto.SKU && p.IsActive))
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

            var defaultWarehouse = await _uow.Warehouses.Query().FirstOrDefaultAsync();
            if (defaultWarehouse != null)
            {
                var newStock = new ProductStock { WarehouseId = defaultWarehouse.Id };
                newStock.InitializeStock(dto.Quantity, dto.MinQuantity);
                product.ProductStocks.Add(newStock);
            }

            _uow.Products.Add(product);
            await _uow.SaveChangesAsync(); // Save to generate Product ID

            if (dto.Quantity > 0 && defaultWarehouse != null)
            {
                _uow.InventoryLogs.Add(new InventoryLog
                {
                    ProductId = product.Id,
                    WarehouseId = defaultWarehouse.Id,
                    Action = InventoryAction.Add,
                    QuantityChanged = dto.Quantity,
                    PreviousQuantity = 0,
                    NewQuantity = dto.Quantity,
                    Notes = "Initial Stock",
                    UserId = null, // System / anonymous
                    ActionDate = DateTime.UtcNow
                });
                await _uow.SaveChangesAsync();
            }

            _uow.AddNotification("Product Added", $"Product '{product.Name}' (SKU: {product.SKU}) has been registered.", "Success", "All");

            product = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            return ApiResponse<ProductDto>.Created(MapToDto(product), "Product created successfully");
        }

        public async Task<ApiResponse<ProductDto>> UpdateAsync(int id, UpdateProductDto dto)
        {
            var product = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.NotFound($"Product with ID {id} not found");

            if (!string.IsNullOrWhiteSpace(dto.SKU) &&
                await _uow.Products.AnyAsync(p => p.SKU == dto.SKU && p.Id != id && p.IsActive))
                return ApiResponse<ProductDto>.Fail($"A product with SKU '{dto.SKU}' already exists");

            product.Name = dto.Name;
            product.SKU = dto.SKU;
            product.Barcode = dto.Barcode;
            product.QRCode = dto.QRCode;
            product.PurchasePrice = dto.PurchasePrice;
            product.Price = dto.Price;
            product.Tax = dto.Tax;
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

            var previousTotalQuantity = product.ProductStocks.Sum(s => s.Quantity);
            var previousMinQuantity = product.ProductStocks.Sum(s => s.MinQuantity);

            var defaultWarehouse = await _uow.Warehouses.Query().FirstOrDefaultAsync();
            if (defaultWarehouse != null)
            {
                var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == defaultWarehouse.Id);
                if (stock != null)
                {
                    stock.MinQuantity = dto.MinQuantity;
                }
                else
                {
                        var newStock = new ProductStock { WarehouseId = defaultWarehouse.Id };
                        newStock.InitializeStock(dto.Quantity, dto.MinQuantity);
                        product.ProductStocks.Add(newStock);
                }
            }

            var currentTotalQuantity = product.ProductStocks.Sum(s => s.Quantity);
            var currentMinQuantity = product.ProductStocks.Sum(s => s.MinQuantity);

            // Note: Low Stock notifications are now handled by Domain Events and MediatR (ProductStockLowEventHandler)

            await _uow.SaveChangesAsync();

            product = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.Supplier)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
                .FirstOrDefaultAsync(p => p.Id == product.Id);

            return ApiResponse<ProductDto>.Ok(MapToDto(product), "Product updated successfully");
        }

        public async Task<ApiResponse<object>> DeleteAsync(int id)
        {
            var product = await _uow.Products.GetByIdAsync(id);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound($"Product with ID {id} not found");

            product.IsActive = false;
            product.UpdatedAt = DateTime.UtcNow;
            await _uow.SaveChangesAsync();

            return ApiResponse<object>.Ok(null!, "Product deleted successfully");
        }

        public async Task<ApiResponse<List<ProductDto>>> GetLowStockAsync()
        {
            var products = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Brand)
                .Include(p => p.ProductStocks)
                .ThenInclude(s => s.Warehouse)
                .Where(p => p.IsActive && p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity))
                .OrderBy(p => p.ProductStocks.Sum(s => s.Quantity))
                .Select(p => MapToDto(p))
                .ToListAsync();

            return ApiResponse<List<ProductDto>>.Ok(products);
        }

        public async Task<ApiResponse<List<string>>> GetCategoriesAsync()
        {
            var categories = await _uow.Categories.Query()
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
                TotalProducts = await _uow.Products.Query().CountAsync(p => p.IsActive),
                LowStockCount = await _uow.Products.Query().CountAsync(p => p.IsActive && p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity) && p.ProductStocks.Sum(s => s.Quantity) > 0),
                OutOfStockCount = await _uow.Products.Query().CountAsync(p => p.IsActive && p.ProductStocks.Sum(s => s.Quantity) == 0),
                TotalInventoryValue = await _uow.Products.Query().Where(p => p.IsActive).SumAsync(p => p.Price * p.ProductStocks.Sum(s => s.Quantity)),
                TodayMovements = await _uow.InventoryLogs.Query().CountAsync(l => l.ActionDate.Date == today),
                TotalCategories = await _uow.Categories.Query().CountAsync()
            };

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }

        public async Task<ApiResponse<object>> ImportFromExcelAsync(Stream fileStream)
        {
            try
            {
                var rows = MiniExcelLibs.MiniExcel.Query(fileStream).Cast<IDictionary<string, object>>().ToList();
                if (!rows.Any())
                {
                    return ApiResponse<object>.Fail("The Excel file contains no data.");
                }

                var defaultWarehouse = await _uow.Warehouses.Query().FirstOrDefaultAsync();
                if (defaultWarehouse == null)
                {
                    return ApiResponse<object>.Fail("No warehouse exists in the database. Please create a warehouse before importing.");
                }

                var categories = await _uow.Categories.Query().Where(c => c.IsActive).ToListAsync();
                var brands = await _uow.Brands.Query().Where(b => b.IsActive).ToListAsync();
                var units = await _uow.Units.Query().Where(u => u.IsActive).ToListAsync();

                int importedCount = 0;
                int skippedCount = 0;

                foreach (var row in rows)
                {
                    var dict = row.ToDictionary(k => k.Key.Trim().ToLower(), v => v.Value);

                    string? name = dict.TryGetValue("name", out var n) ? n?.ToString() : null;
                    string? sku = dict.TryGetValue("sku", out var s) ? s?.ToString() : null;

                    if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(sku))
                    {
                        skippedCount++;
                        continue;
                    }

                    if (await _uow.Products.AnyAsync(p => p.SKU == sku && p.IsActive))
                    {
                        skippedCount++;
                        continue;
                    }

                    decimal price = 0;
                    if (dict.TryGetValue("price", out var pVal) && pVal != null)
                    {
                        decimal.TryParse(pVal.ToString(), out price);
                    }

                    decimal purchasePrice = 0;
                    if (dict.TryGetValue("purchaseprice", out var ppVal) && ppVal != null)
                    {
                        decimal.TryParse(ppVal.ToString(), out purchasePrice);
                    }

                    int quantity = 0;
                    if (dict.TryGetValue("quantity", out var qVal) && qVal != null)
                    {
                        int.TryParse(qVal.ToString(), out quantity);
                    }

                    int minQuantity = 0;
                    if (dict.TryGetValue("minquantity", out var mqVal) && mqVal != null)
                    {
                        int.TryParse(mqVal.ToString(), out minQuantity);
                    }

                    string? categoryName = dict.TryGetValue("category", out var cVal) ? cVal?.ToString()?.Trim() : null;
                    int? categoryId = null;
                    if (!string.IsNullOrWhiteSpace(categoryName))
                    {
                        var cat = categories.FirstOrDefault(c => c.Name.Equals(categoryName, StringComparison.OrdinalIgnoreCase));
                        if (cat == null)
                        {
                            cat = new Category { Name = categoryName, IsActive = true };
                            _uow.Categories.Add(cat);
                            await _uow.SaveChangesAsync();
                            categories.Add(cat);
                        }
                        categoryId = cat.Id;
                    }

                    string? brandName = dict.TryGetValue("brand", out var bVal) ? bVal?.ToString()?.Trim() : null;
                    int? brandId = null;
                    if (!string.IsNullOrWhiteSpace(brandName))
                    {
                        var brd = brands.FirstOrDefault(b => b.Name.Equals(brandName, StringComparison.OrdinalIgnoreCase));
                        if (brd == null)
                        {
                            brd = new Brand { Name = brandName, IsActive = true };
                            _uow.Brands.Add(brd);
                            await _uow.SaveChangesAsync();
                            brands.Add(brd);
                        }
                        brandId = brd.Id;
                    }

                    string? unitName = dict.TryGetValue("unit", out var uVal) ? uVal?.ToString()?.Trim() : null;
                    int? unitId = null;
                    if (!string.IsNullOrWhiteSpace(unitName))
                    {
                        var un = units.FirstOrDefault(u => u.Name.Equals(unitName, StringComparison.OrdinalIgnoreCase));
                        if (un == null)
                        {
                            un = new Unit { Name = unitName, IsActive = true };
                            _uow.Units.Add(un);
                            await _uow.SaveChangesAsync();
                            units.Add(un);
                        }
                        unitId = un.Id;
                    }

                    string? barcode = dict.TryGetValue("barcode", out var bc) ? bc?.ToString() : null;
                    string? description = dict.TryGetValue("description", out var desc) ? desc?.ToString() : null;

                    var product = new Product
                    {
                        Name = name,
                        SKU = sku,
                        Price = price,
                        PurchasePrice = purchasePrice,
                        Barcode = barcode,
                        Description = description,
                        CategoryId = categoryId,
                        BrandId = brandId,
                        UnitId = unitId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var newStock = new ProductStock { WarehouseId = defaultWarehouse.Id };
                    newStock.InitializeStock(quantity, minQuantity);
                    product.ProductStocks.Add(newStock);

                    _uow.Products.Add(product);
                    await _uow.SaveChangesAsync();

                    if (quantity > 0)
                    {
                        _uow.InventoryLogs.Add(new InventoryLog
                        {
                            ProductId = product.Id,
                            WarehouseId = defaultWarehouse.Id,
                            Action = InventoryAction.Add,
                            QuantityChanged = quantity,
                            PreviousQuantity = 0,
                            NewQuantity = quantity,
                            Notes = "Bulk Import Stock",
                            ActionDate = DateTime.UtcNow
                        });
                        await _uow.SaveChangesAsync();
                    }

                    importedCount++;
                }

                _uow.AddNotification("Bulk Import Success", $"Imported {importedCount} products. Skipped {skippedCount} duplicates.", "Success", "All");
                return ApiResponse<object>.Ok(new { ImportedCount = importedCount, SkippedCount = skippedCount }, $"Successfully imported {importedCount} products. Skipped {skippedCount} duplicate/invalid rows.");
            }
            catch (Exception ex)
            {
                return ApiResponse<object>.Fail($"Excel import failed: {ex.Message}");
            }
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
            Quantity = p.ProductStocks != null ? p.ProductStocks.Sum(s => s.Quantity) : 0,
            MinQuantity = p.ProductStocks != null ? p.ProductStocks.Sum(s => s.MinQuantity) : 0,
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
            IsLowStock = p.ProductStocks != null && p.ProductStocks.Sum(s => s.Quantity) <= p.ProductStocks.Sum(s => s.MinQuantity) && p.ProductStocks.Sum(s => s.Quantity) > 0,
            TotalValue = p.Price * (p.ProductStocks != null ? p.ProductStocks.Sum(s => s.Quantity) : 0),
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            ProductStocks = p.ProductStocks != null ? p.ProductStocks.Select(s => new ProductStockDto
            {
                WarehouseId = s.WarehouseId,
                WarehouseName = s.Warehouse?.Name ?? string.Empty,
                Quantity = s.Quantity,
                MinQuantity = s.MinQuantity
            }).ToList() : new List<ProductStockDto>()
        };
    }
}
