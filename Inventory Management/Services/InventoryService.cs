using Inventory_Management._DbContext;
using Inventory_Management.Common;
using Inventory_Management.Dtos.Inventory_Dtos;
using Inventory_Management.Models;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _db;

        public InventoryService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<ApiResponse<object>> AddItemAsync(AddInventoryDto dto, int userId)
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToAdd <= 0)
                return ApiResponse<object>.Fail("Quantity to add must be greater than zero");

            var previous = product.Quantity;
            product.Quantity += dto.QuantityToAdd;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Add,
                QuantityChanged = dto.QuantityToAdd,
                PreviousQuantity = previous,
                NewQuantity = product.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return ApiResponse<object>.Ok(null!, $"Added {dto.QuantityToAdd} units. New stock: {product.Quantity}");
        }

        public async Task<ApiResponse<object>> SellProductAsync(SellProductDto dto, int userId)
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToSell <= 0)
                return ApiResponse<object>.Fail("Quantity to sell must be greater than zero");

            if (product.Quantity < dto.QuantityToSell)
                return ApiResponse<object>.Fail($"Insufficient stock. Available: {product.Quantity}, Requested: {dto.QuantityToSell}");

            var previous = product.Quantity;
            product.Quantity -= dto.QuantityToSell;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Sell,
                QuantityChanged = dto.QuantityToSell,
                PreviousQuantity = previous,
                NewQuantity = product.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return ApiResponse<object>.Ok(null!, $"Sold {dto.QuantityToSell} units. Remaining stock: {product.Quantity}");
        }

        public async Task<ApiResponse<object>> AdjustStockAsync(AdjustStockDto dto, int userId)
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.NewQuantity < 0)
                return ApiResponse<object>.Fail("Quantity cannot be negative");

            var previous = product.Quantity;
            var change = dto.NewQuantity - previous;
            product.Quantity = dto.NewQuantity;
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

            await _db.SaveChangesAsync();
            return ApiResponse<object>.Ok(null!, $"Stock adjusted from {previous} to {dto.NewQuantity}");
        }

        public async Task<ApiResponse<object>> ReturnProductAsync(ReturnProductDto dto, int userId)
        {
            var product = await _db.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return ApiResponse<object>.NotFound("Product not found");

            if (dto.QuantityToReturn <= 0)
                return ApiResponse<object>.Fail("Return quantity must be greater than zero");

            var previous = product.Quantity;
            product.Quantity += dto.QuantityToReturn;
            product.UpdatedAt = DateTime.UtcNow;

            _db.InventoryLogs.Add(new InventoryLog
            {
                ProductId = product.Id,
                UserId = userId,
                Action = InventoryAction.Return,
                QuantityChanged = dto.QuantityToReturn,
                PreviousQuantity = previous,
                NewQuantity = product.Quantity,
                Notes = dto.Notes,
                ActionDate = DateTime.UtcNow
            });

            await _db.SaveChangesAsync();
            return ApiResponse<object>.Ok(null!, $"Returned {dto.QuantityToReturn} units. New stock: {product.Quantity}");
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

            if (query.FromDate.HasValue)
                q = q.Where(l => l.ActionDate >= query.FromDate.Value);

            if (query.ToDate.HasValue)
                q = q.Where(l => l.ActionDate <= query.ToDate.Value.AddDays(1));

            q = query.SortOrder.ToLower() == "asc"
                ? q.OrderBy(l => l.ActionDate)
                : q.OrderByDescending(l => l.ActionDate);

            var totalCount = await q.CountAsync();

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
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
