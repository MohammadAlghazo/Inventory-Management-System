using InventoryManagement.Domain.Common;

namespace InventoryManagement.Domain.Events
{
    public record ProductStockLowEvent(int ProductId, int WarehouseId, int AvailableQuantity, int MinQuantity) : IDomainEvent;
}
