using InventoryManagement.Domain.Events;
using InventoryManagement.Domain.Interfaces;
using MediatR;

namespace InventoryManagement.Application.EventHandlers
{
    public class ProductStockLowEventHandler : INotificationHandler<ProductStockLowEvent>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ProductStockLowEventHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public Task Handle(ProductStockLowEvent notification, CancellationToken cancellationToken)
        {
            var message = $"Stock for Product {notification.ProductId} in Warehouse {notification.WarehouseId} is low. Available: {notification.AvailableQuantity}, Min: {notification.MinQuantity}.";
            _unitOfWork.AddNotification("Low Stock Alert", message, "LowStock", "WarehouseStaff");
            return Task.CompletedTask;
        }
    }
}
