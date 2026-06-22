using InventoryManagement.Application.Common.Interfaces;
using InventoryManagement.Domain.Interfaces;
using InventoryManagement.Domain.Common;
using InventoryManagement.Application.Dtos;
using InventoryManagement.Domain.Entities;
using InventoryManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Application.Services
{
    public class SalesOrderService : ISalesOrderService
    {
        private readonly IUnitOfWork _uow;

        public SalesOrderService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<ApiResponse<PagedResult<SalesOrderDto>>> GetSalesOrdersAsync(int page, int pageSize, string? search)
        {
            var query = _uow.SalesOrders.Query()
                .Include(s => s.Customer)
                .Include(s => s.Warehouse)
                .Include(s => s.CreatedBy)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(s => 
                    s.OrderNumber.ToLower().Contains(lowerSearch) || 
                    (s.Customer != null && s.Customer.Name.ToLower().Contains(lowerSearch)));
            }

            var totalCount = await query.CountAsync();
            var clampedPageSize = Math.Min(pageSize, 100);
            var items = await query
                .OrderByDescending(s => s.OrderDate)
                .Skip((page - 1) * clampedPageSize)
                .Take(clampedPageSize)
                .ToListAsync();

            var dtos = items.Select(MapToDto).ToList();

            return ApiResponse<PagedResult<SalesOrderDto>>.Ok(new PagedResult<SalesOrderDto>
            {
                Items = dtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        public async Task<ApiResponse<SalesOrderDto>> GetSalesOrderByIdAsync(int id)
        {
            var order = await _uow.SalesOrders.Query()
                .Include(s => s.Customer)
                .Include(s => s.Warehouse)
                .Include(s => s.CreatedBy)
                .Include(s => s.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (order == null)
                return ApiResponse<SalesOrderDto>.Fail("Sales order not found", 404);

            return ApiResponse<SalesOrderDto>.Ok(MapToDto(order));
        }

        public async Task<ApiResponse<SalesOrderDto>> CreateSalesOrderAsync(CreateSalesOrderDto dto, int userId)
        {
            if (!dto.Items.Any())
                return ApiResponse<SalesOrderDto>.Fail("Order must contain at least one item.");

            var orderNumber = $"SO-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";

            var order = new SalesOrder
            {
                OrderNumber = orderNumber,
                CustomerId = dto.CustomerId,
                WarehouseId = dto.WarehouseId,
                ExpectedShipDate = dto.ExpectedShipDate,
                CreatedById = userId,
                Status = OrderStatus.Draft,
                OrderDate = DateTime.UtcNow
            };

            decimal totalAmount = 0;

            foreach (var item in dto.Items)
            {
                var productStock = await _uow.ProductStocks.Query()
                    .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.WarehouseId == dto.WarehouseId);

                if (productStock == null)
                {
                    return ApiResponse<SalesOrderDto>.Fail($"Stock record not found for product ID {item.ProductId} in selected warehouse.");
                }

                int availableQuantity = productStock.AvailableQuantity;
                if (availableQuantity < item.Quantity)
                {
                    return ApiResponse<SalesOrderDto>.Fail($"Insufficient available stock for product ID {item.ProductId} in selected warehouse. Available: {availableQuantity}, Requested: {item.Quantity}");
                }

                productStock.ReserveStock(item.Quantity);

                var total = (item.Quantity * item.UnitPrice) - item.Discount;
                totalAmount += total;

                order.Items.Add(new SalesOrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Discount = item.Discount,
                    Total = total
                });
            }

            order.TotalAmount = totalAmount;

            _uow.SalesOrders.Add(order);
            await _uow.SaveChangesAsync();

            return await GetSalesOrderByIdAsync(order.Id);
        }

        public async Task<ApiResponse<object>> ShipSalesOrderAsync(ShipSalesOrderDto dto, int userId)
        {
            var order = await _uow.SalesOrders.Query()
                .Include(s => s.Items)
                .FirstOrDefaultAsync(s => s.Id == dto.SalesOrderId);

            if (order == null)
                return ApiResponse<object>.Fail("Sales order not found", 404);

            if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Completed)
                return ApiResponse<object>.Fail("Order is already shipped or completed.");

            foreach (var item in order.Items)
            {
                var productStock = await _uow.ProductStocks.Query()
                    .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.WarehouseId == order.WarehouseId);

                if (productStock == null || productStock.Quantity < item.Quantity)
                {
                    return ApiResponse<object>.Fail($"Insufficient stock for product ID {item.ProductId} to ship order.");
                }

                int oldQuantity = productStock.Quantity;
                productStock.ShipStock(item.Quantity);

                _uow.InventoryLogs.Add(new InventoryLog
                {
                    ProductId = item.ProductId,
                    WarehouseId = order.WarehouseId,
                    QuantityChanged = -item.Quantity,
                    PreviousQuantity = oldQuantity,
                    NewQuantity = productStock.Quantity,
                    Action = InventoryAction.ShipSO,
                    Notes = $"Shipped items for Sales Order {order.OrderNumber}. Tracking: {dto.TrackingNumber}. {dto.Notes}",
                    UserId = userId,
                    ActionDate = DateTime.UtcNow
                });
            }

            order.Status = OrderStatus.Shipped;
            await _uow.SaveChangesAsync();

            return ApiResponse<object>.Ok(null, "Sales order shipped successfully and inventory updated.");
        }

        private SalesOrderDto MapToDto(SalesOrder s)
        {
            return new SalesOrderDto
            {
                Id = s.Id,
                OrderNumber = s.OrderNumber,
                CustomerId = s.CustomerId,
                CustomerName = s.Customer?.Name ?? string.Empty,
                WarehouseId = s.WarehouseId,
                WarehouseName = s.Warehouse?.Name ?? string.Empty,
                Status = s.Status.ToString(),
                StatusCode = s.Status,
                OrderDate = s.OrderDate,
                ExpectedShipDate = s.ExpectedShipDate,
                TotalAmount = s.TotalAmount,
                CreatedByName = s.CreatedBy != null ? $"{s.CreatedBy.FirstName} {s.CreatedBy.LastName}" : string.Empty,
                Items = s.Items.Select(i => new SalesOrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? string.Empty,
                    ProductSKU = i.Product?.SKU ?? string.Empty,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Discount = i.Discount,
                    Total = i.Total
                }).ToList()
            };
        }
    }
}
