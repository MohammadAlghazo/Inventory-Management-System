using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class PurchaseOrderService : IPurchaseOrderService
    {
        private readonly IAppDbContext _db;

        public PurchaseOrderService(IAppDbContext db)
        {
            _db = db;
        }

        public async Task<PagedResult<PurchaseOrderDto>> GetPurchaseOrdersAsync(int page, int pageSize, string? search)
        {
            var query = _db.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.CreatedBy)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(p => 
                    p.OrderNumber.ToLower().Contains(lowerSearch) || 
                    (p.Supplier != null && p.Supplier.Name.ToLower().Contains(lowerSearch)));
            }

            var totalCount = await query.CountAsync();
            var clampedPageSize = Math.Min(pageSize, 100);
            var items = await query
                .OrderByDescending(p => p.OrderDate)
                .Skip((page - 1) * clampedPageSize)
                .Take(clampedPageSize)
                .ToListAsync();

            var dtos = items.Select(MapToDto).ToList();

            return new PagedResult<PurchaseOrderDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<ApiResponse<PurchaseOrderDto>> GetPurchaseOrderByIdAsync(int id)
        {
            var order = await _db.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.Warehouse)
                .Include(p => p.CreatedBy)
                .Include(p => p.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (order == null)
                return ApiResponse<PurchaseOrderDto>.Fail("Purchase order not found", 404);

            return ApiResponse<PurchaseOrderDto>.Ok(MapToDto(order));
        }

        public async Task<ApiResponse<PurchaseOrderDto>> CreatePurchaseOrderAsync(CreatePurchaseOrderDto dto, int userId)
        {
            if (!dto.Items.Any())
                return ApiResponse<PurchaseOrderDto>.Fail("Order must contain at least one item.");

            var orderNumber = $"PO-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var order = new PurchaseOrder
            {
                OrderNumber = orderNumber,
                SupplierId = dto.SupplierId,
                WarehouseId = dto.WarehouseId,
                ExpectedDate = dto.ExpectedDate,
                CreatedById = userId,
                Status = OrderStatus.Draft,
                OrderDate = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            foreach (var item in dto.Items)
            {
                var totalCost = item.Quantity * item.UnitCost;
                totalAmount += totalCost;

                order.Items.Add(new PurchaseOrderItem
                {
                    ProductId = item.ProductId,
                    QuantityOrdered = item.Quantity,
                    UnitCost = item.UnitCost,
                    TotalCost = totalCost
                });
            }

            order.TotalAmount = totalAmount;

            _db.PurchaseOrders.Add(order);
            await _db.SaveChangesAsync();

            return await GetPurchaseOrderByIdAsync(order.Id);
        }

        public async Task<ApiResponse<object>> ReceivePurchaseOrderAsync(int id, ReceivePurchaseOrderDto dto, int userId)
        {
            var order = await _db.PurchaseOrders
                .Include(p => p.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (order == null)
                return ApiResponse<object>.Fail("Purchase order not found", 404);

            if (order.Status == OrderStatus.Completed)
                return ApiResponse<object>.Fail("Order is already fully received.");

            if (dto.Items == null || !dto.Items.Any())
                return ApiResponse<object>.Fail("No received items were specified.");

            foreach (var receivedItem in dto.Items)
            {
                if (receivedItem.QuantityReceived <= 0) continue;

                var item = order.Items.FirstOrDefault(i => i.ProductId == receivedItem.ProductId);
                if (item == null)
                    return ApiResponse<object>.Fail($"Product with ID {receivedItem.ProductId} is not part of this purchase order.");

                if (item.QuantityReceived + receivedItem.QuantityReceived > item.QuantityOrdered)
                    return ApiResponse<object>.Fail($"Cannot receive more than ordered for Product '{item.Product?.Name}'. Ordered: {item.QuantityOrdered}, Already Received: {item.QuantityReceived}, New Receipt: {receivedItem.QuantityReceived}");

                var product = await _db.Products
                    .Include(p => p.ProductStocks)
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId);

                if (product == null) continue;

                var productStock = product.ProductStocks
                    .FirstOrDefault(ps => ps.WarehouseId == order.WarehouseId);

                if (productStock == null)
                {
                    productStock = new ProductStock
                    {
                        ProductId = item.ProductId,
                        WarehouseId = order.WarehouseId,
                        Quantity = 0,
                        MinQuantity = 10
                    };
                    _db.ProductStocks.Add(productStock);
                    product.ProductStocks.Add(productStock);
                }

                int receivedQty = receivedItem.QuantityReceived;

                // Weighted Average Cost (WAC) Calculation
                int currentTotalQty = product.ProductStocks.Sum(ps => ps.Quantity);
                decimal currentTotalValue = currentTotalQty * product.PurchasePrice;
                decimal receivedValue = receivedQty * item.UnitCost;
                
                int newTotalQty = currentTotalQty + receivedQty;
                
                if (newTotalQty > 0)
                {
                    product.PurchasePrice = (currentTotalValue + receivedValue) / newTotalQty;
                }

                productStock.Quantity += receivedQty;
                item.QuantityReceived += receivedQty;

                _db.InventoryLogs.Add(new InventoryLog
                {
                    ProductId = item.ProductId,
                    WarehouseId = order.WarehouseId,
                    QuantityChanged = receivedQty,
                    PreviousQuantity = productStock.Quantity - receivedQty,
                    NewQuantity = productStock.Quantity,
                    Action = InventoryAction.ReceivePO,
                    Notes = string.IsNullOrWhiteSpace(dto.Notes) ? $"Received items for Purchase Order {order.OrderNumber}" : dto.Notes,
                    UserId = userId,
                    ActionDate = DateTime.UtcNow
                });
            }

            // Check if order is fully completed or partially received
            bool allCompleted = order.Items.All(i => i.QuantityReceived == i.QuantityOrdered);
            bool anyReceived = order.Items.Any(i => i.QuantityReceived > 0);

            if (allCompleted)
            {
                order.Status = OrderStatus.Completed;
            }
            else if (anyReceived)
            {
                order.Status = OrderStatus.Partial;
            }

            await _db.SaveChangesAsync();

            return ApiResponse<object>.Ok(null, "Purchase order received successfully and inventory updated.");
        }

        private PurchaseOrderDto MapToDto(PurchaseOrder p)
        {
            return new PurchaseOrderDto
            {
                Id = p.Id,
                OrderNumber = p.OrderNumber,
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier?.Name ?? string.Empty,
                WarehouseId = p.WarehouseId,
                WarehouseName = p.Warehouse?.Name ?? string.Empty,
                Status = p.Status.ToString(),
                StatusCode = p.Status,
                OrderDate = p.OrderDate,
                ExpectedDate = p.ExpectedDate,
                TotalAmount = p.TotalAmount,
                CreatedByName = p.CreatedBy != null ? $"{p.CreatedBy.FirstName} {p.CreatedBy.LastName}" : string.Empty,
                Items = p.Items.Select(i => new PurchaseOrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? string.Empty,
                    ProductSKU = i.Product?.SKU ?? string.Empty,
                    QuantityOrdered = i.QuantityOrdered,
                    QuantityReceived = i.QuantityReceived,
                    UnitCost = i.UnitCost,
                    TotalCost = i.TotalCost
                }).ToList()
            };
        }
    }
}
