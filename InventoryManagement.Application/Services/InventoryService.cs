using InventoryManagement.Application.Extensions;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Inventory_Dtos;
using InventoryManagement.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IAppDbContext _db;

        public InventoryService(IAppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<object>> AddItemAsync(AddInventoryDto dto, int userId)
        {
            var product = await _db.Products.Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToAdd <= 0)
                return ApiResponse<object>.Fail("Quantity to add must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _db.Warehouses.FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id, Quantity = 0, MinQuantity = 0 };
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            stock.Quantity += dto.QuantityToAdd;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Add,
                QuantityChanged = dto.QuantityToAdd,
                PreviousQuantity = previous,
                NewQuantity = stock.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            _db.AddNotification("Stock Added", $"{dto.QuantityToAdd} units of '{product.Name}' added. New stock: {stock.Quantity}.", "Success", "All");

            try
            {
                await _db.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Added {dto.QuantityToAdd} units. New stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> SellProductAsync(SellProductDto dto, int userId)
        {
            var product = await _db.Products.Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToSell <= 0)
                return ApiResponse<object>.Fail("Quantity to sell must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _db.Warehouses.FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null) return ApiResponse<object>.Fail("Stock not found in the selected warehouse");

            if (stock.Quantity < dto.QuantityToSell)
                return ApiResponse<object>.Fail($"Insufficient stock. Available: {stock.Quantity}, Requested: {dto.QuantityToSell}");

            var previous = stock.Quantity;
            stock.Quantity -= dto.QuantityToSell;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Sell,
                QuantityChanged = dto.QuantityToSell,
                PreviousQuantity = previous,
                NewQuantity = stock.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            _db.AddNotification("Stock Sold", $"{dto.QuantityToSell} units of '{product.Name}' sold. Remaining stock: {stock.Quantity}.", "Info", "All");

            if (previous > stock.MinQuantity && stock.Quantity <= stock.MinQuantity)
            {
                _db.AddNotification("Low Stock Warning", $"Product '{product.Name}' went low stock! Only {stock.Quantity} remaining.", "Danger", "All");
            }

            try
            {
                await _db.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Sold {dto.QuantityToSell} units. Remaining stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> AdjustStockAsync(AdjustStockDto dto, int userId)
        {
            var product = await _db.Products.Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.NewQuantity < 0)
                return ApiResponse<object>.Fail("Quantity cannot be negative");

            var warehouseId = dto.WarehouseId ?? (await _db.Warehouses.FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id, Quantity = 0, MinQuantity = 0 };
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            var change = dto.NewQuantity - previous;
            stock.Quantity = dto.NewQuantity;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Adjust,
                QuantityChanged = Math.Abs(change),
                PreviousQuantity = previous,
                NewQuantity = dto.NewQuantity,
                Notes = dto.Notes ?? $"Manual adjustment from {previous} to {dto.NewQuantity}",
                ActionDate = DateTime.UtcNow
            });

            _db.AddNotification("Stock Adjusted", $"'{product.Name}' adjusted from {previous} to {stock.Quantity}.", "Warning", "Manager");

            if (previous > stock.MinQuantity && stock.Quantity <= stock.MinQuantity)
            {
                _db.AddNotification("Low Stock Warning", $"Product '{product.Name}' went low stock! Only {stock.Quantity} remaining.", "Danger", "All");
            }

            try
            {
                await _db.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Stock adjusted from {previous} to {dto.NewQuantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> ReturnProductAsync(ReturnProductDto dto, int userId)
        {
            var product = await _db.Products.Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToReturn <= 0)
                return ApiResponse<object>.Fail("Return quantity must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _db.Warehouses.FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id, Quantity = 0, MinQuantity = 0 };
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            stock.Quantity += dto.QuantityToReturn;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Return,
                QuantityChanged = dto.QuantityToReturn,
                PreviousQuantity = previous,
                NewQuantity = stock.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            _db.AddNotification("Stock Returned", $"{dto.QuantityToReturn} units of '{product.Name}' returned. New stock: {stock.Quantity}.", "Info", "All");

            try
            {
                await _db.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Returned {dto.QuantityToReturn} units. New stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<PagedResult<InventoryLogDto>>> GetAllLogsAsync(InventoryLogQueryParams query)
        {
            var q = _db.InventoryLogs
                .Include(l => l.Product)
                .Include(l => l.User)
                .AsQueryable();

            if (query.ProductId.HasValue)
                q = q.Where(l => l.ProductId == query.ProductId.Value);

            if (!string.IsNullOrWhiteSpace(query.Action) &&
                Enum.TryParse<InventoryAction>(query.Action, true, out var actionEnum))
                q = q.Where(l => l.Action == actionEnum);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.ToLower();
                q = q.Where(l => 
                    l.Product.Name.ToLower().Contains(s) ||
                    (l.Notes != null && l.Notes.ToLower().Contains(s)) ||
                    (l.User != null && l.User.Username.ToLower().Contains(s)) ||
                    l.Id.ToString().Contains(s)
                );
            }

            if (query.FromDate.HasValue)
                q = q.Where(l => l.ActionDate >= query.FromDate.Value);

            if (query.ToDate.HasValue)
                q = q.Where(l => l.ActionDate <= query.ToDate.Value.AddDays(1));

            q = query.SortOrder.ToLower() == "asc"
                ? q.OrderBy(l => l.ActionDate)
                : q.OrderByDescending(l => l.ActionDate);

            var totalCount = await q.CountAsync();
            var clampedPageSize = Math.Min(query.PageSize, 100);

            var items = await q
                .Skip((query.Page - 1) * clampedPageSize)
                .Take(clampedPageSize)
                .Select(l => new InventoryLogDto
                {
                    Id = l.Id,
                    ProductId = l.ProductId,
                    ProductName = l.Product.Name,
                    Action = l.Action.ToString(),
                    QuantityChanged = l.QuantityChanged,
                    PreviousQuantity = l.PreviousQuantity,
                    NewQuantity = l.NewQuantity,
                    Notes = l.Notes,
                    PerformedBy = l.User != null ? l.User.Username : "System",
                    ActionDate = l.ActionDate
                })
                .ToListAsync();

            return ApiResponse<PagedResult<InventoryLogDto>>.Ok(new PagedResult<InventoryLogDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<ApiResponse<List<InventoryLogDto>>> GetLogsByProductAsync(int productId)
        {
            var logs = await _db.InventoryLogs
                .Include(l => l.Product)
                .Include(l => l.User)
                .Where(l => l.ProductId == productId)
                .OrderByDescending(l => l.ActionDate)
                .Select(l => new InventoryLogDto
                {
                    Id = l.Id,
                    ProductId = l.ProductId,
                    ProductName = l.Product.Name,
                    Action = l.Action.ToString(),
                    QuantityChanged = l.QuantityChanged,
                    PreviousQuantity = l.PreviousQuantity,
                    NewQuantity = l.NewQuantity,
                    Notes = l.Notes,
                    PerformedBy = l.User != null ? l.User.Username : "System",
                    ActionDate = l.ActionDate
                })
                .ToListAsync();

            return ApiResponse<List<InventoryLogDto>>.Ok(logs);
        }
    }
}

