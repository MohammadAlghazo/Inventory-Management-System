using InventoryManagement.Application.Extensions;
using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos.Inventory_Dtos;
using InventoryManagement.Application.Dtos.Product_Dtos;
using InventoryManagement.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly IUnitOfWork _uow;

        public InventoryService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<object>> AddItemAsync(AddInventoryDto dto, int userId)
        {
            var product = await _uow.Products.Query().Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToAdd <= 0)
                return ApiResponse<object>.Fail("Quantity to add must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _uow.Warehouses.Query().FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id };
                stock.InitializeStock(0, 0);
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            stock.ReceiveStock(dto.QuantityToAdd);
            product.UpdatedAt = DateTime.UtcNow;

            _uow.InventoryLogs.Add(new InventoryLog
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

            _uow.AddNotification("Stock Added", $"{dto.QuantityToAdd} units of '{product.Name}' added. New stock: {stock.Quantity}.", "Success", "All");

            try
            {
                await _uow.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Added {dto.QuantityToAdd} units. New stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> SellProductAsync(SellProductDto dto, int userId)
        {
            var product = await _uow.Products.Query().Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToSell <= 0)
                return ApiResponse<object>.Fail("Quantity to sell must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _uow.Warehouses.Query().FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null) return ApiResponse<object>.Fail("Stock not found in the selected warehouse");

            if (stock.Quantity < dto.QuantityToSell)
                return ApiResponse<object>.Fail($"Insufficient stock. Available: {stock.Quantity}, Requested: {dto.QuantityToSell}");

            var previous = stock.Quantity;
            stock.ShipStock(dto.QuantityToSell);
            product.UpdatedAt = DateTime.UtcNow;

            _uow.InventoryLogs.Add(new InventoryLog
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

            _uow.AddNotification("Stock Sold", $"{dto.QuantityToSell} units of '{product.Name}' sold. Remaining stock: {stock.Quantity}.", "Info", "All");

            // Low Stock warnings are now handled by Domain Events and MediatR

            try
            {
                await _uow.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Sold {dto.QuantityToSell} units. Remaining stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> AdjustStockAsync(AdjustStockDto dto, int userId)
        {
            var product = await _uow.Products.Query().Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.NewQuantity < 0)
                return ApiResponse<object>.Fail("Quantity cannot be negative");

            var warehouseId = dto.WarehouseId ?? (await _uow.Warehouses.Query().FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id };
                stock.InitializeStock(0, 0);
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            var change = dto.NewQuantity - previous;
            stock.AdjustStock(dto.NewQuantity);
            product.UpdatedAt = DateTime.UtcNow;

            _uow.InventoryLogs.Add(new InventoryLog
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

            _uow.AddNotification("Stock Adjusted", $"'{product.Name}' adjusted from {previous} to {stock.Quantity}.", "Warning", "SuperAdmin");

            // Low Stock warnings are now handled by Domain Events and MediatR

            try
            {
                await _uow.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Stock adjusted from {previous} to {dto.NewQuantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<object>> ReturnProductAsync(ReturnProductDto dto, int userId)
        {
            var product = await _uow.Products.Query().Include(p => p.ProductStocks).FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToReturn <= 0)
                return ApiResponse<object>.Fail("Return quantity must be greater than zero");

            var warehouseId = dto.WarehouseId ?? (await _uow.Warehouses.Query().FirstOrDefaultAsync())?.Id ?? 0;
            if (warehouseId == 0) return ApiResponse<object>.Fail("No warehouse available.");

            var stock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == warehouseId);
            if (stock == null)
            {
                stock = new ProductStock { WarehouseId = warehouseId, ProductId = product.Id };
                stock.InitializeStock(0, 0);
                product.ProductStocks.Add(stock);
            }

            var previous = stock.Quantity;
            stock.ReceiveStock(dto.QuantityToReturn);
            product.UpdatedAt = DateTime.UtcNow;

            _uow.InventoryLogs.Add(new InventoryLog
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

            _uow.AddNotification("Stock Returned", $"{dto.QuantityToReturn} units of '{product.Name}' returned. New stock: {stock.Quantity}.", "Info", "All");

            try
            {
                await _uow.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, $"Returned {dto.QuantityToReturn} units. New stock: {stock.Quantity}");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<ProductDto>> SearchByBarcodeAsync(string skuOrBarcode)
        {
            var product = await _uow.Products.Query()
                .Include(p => p.Category)
                .Include(p => p.Unit)
                .Include(p => p.Supplier)
                .Include(p => p.Brand)
                .Include(p => p.ProductStocks)
                    .ThenInclude(ps => ps.Warehouse)
                .FirstOrDefaultAsync(p => p.SKU == skuOrBarcode || p.Barcode == skuOrBarcode);

            if (product == null || !product.IsActive)
                return ApiResponse<ProductDto>.Fail("Product not found.", 404);

            var dto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                SKU = product.SKU,
                Barcode = product.Barcode,
                Price = product.Price,
                PurchasePrice = product.PurchasePrice,
                Quantity = product.ProductStocks?.Sum(s => s.Quantity) ?? 0,
                CategoryName = product.Category?.Name,
                SupplierName = product.Supplier?.Name,
                ProductStocks = product.ProductStocks.Select(ps => new ProductStockDto
                {
                    WarehouseId = ps.WarehouseId,
                    WarehouseName = ps.Warehouse?.Name ?? "Unknown",
                    Quantity = ps.Quantity,
                    MinQuantity = ps.MinQuantity
                }).ToList()
            };

            return ApiResponse<ProductDto>.Ok(dto);
        }

        public async Task<ApiResponse<object>> TransferStockAsync(TransferStockDto dto, int userId)
        {
            if (dto.SourceWarehouseId == dto.DestinationWarehouseId)
                return ApiResponse<object>.Fail("Source and destination warehouses cannot be the same.");

            if (dto.Quantity <= 0)
                return ApiResponse<object>.Fail("Quantity must be greater than zero.");

            var product = await _uow.Products.Query()
                .Include(p => p.ProductStocks)
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found.");

            var sourceStock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == dto.SourceWarehouseId);
            if (sourceStock == null || sourceStock.Quantity < dto.Quantity)
                return ApiResponse<object>.Fail($"Insufficient stock in source warehouse. Available: {sourceStock?.Quantity ?? 0}");

            var destStock = product.ProductStocks.FirstOrDefault(s => s.WarehouseId == dto.DestinationWarehouseId);
            if (destStock == null)
            {
                destStock = new ProductStock { WarehouseId = dto.DestinationWarehouseId, ProductId = product.Id };
                destStock.InitializeStock(0, 0);
                product.ProductStocks.Add(destStock);
            }

            var previousSource = sourceStock.Quantity;
            var previousDest = destStock.Quantity;

            sourceStock.ShipStock(dto.Quantity);
            destStock.ReceiveStock(dto.Quantity);

            _uow.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                WarehouseId = dto.SourceWarehouseId,
                UserId = userId,
                Action = InventoryAction.Adjust,
                QuantityChanged = -dto.Quantity,
                PreviousQuantity = previousSource,
                NewQuantity = sourceStock.Quantity,
                Notes = $"Transferred to Warehouse {dto.DestinationWarehouseId}. {dto.Notes}",
                ActionDate = DateTime.UtcNow
            });

            _uow.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                WarehouseId = dto.DestinationWarehouseId,
                UserId = userId,
                Action = InventoryAction.Adjust,
                QuantityChanged = dto.Quantity,
                PreviousQuantity = previousDest,
                NewQuantity = destStock.Quantity,
                Notes = $"Transferred from Warehouse {dto.SourceWarehouseId}. {dto.Notes}",
                ActionDate = DateTime.UtcNow
            });

            try
            {
                await _uow.SaveChangesAsync();
                return ApiResponse<object>.Ok(null!, "Stock transferred successfully.");
            }
            catch (DbUpdateConcurrencyException)
            {
                return ApiResponse<object>.Fail("Stock was modified by another transaction. Please try again.");
            }
        }

        public async Task<ApiResponse<PagedResult<InventoryLogDto>>> GetAllLogsAsync(InventoryLogQueryParams query)
        {
            var q = _uow.InventoryLogs.Query()
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
            var logs = await _uow.InventoryLogs.Query()
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

