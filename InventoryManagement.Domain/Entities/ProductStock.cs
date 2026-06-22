using System.ComponentModel.DataAnnotations;

using InventoryManagement.Domain.Common;

namespace InventoryManagement.Domain.Entities
{
    public class ProductStock : BaseDomainEntity
    {
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;

        public int Quantity { get; private set; }
        public int ReservedQuantity { get; private set; }
        public int MinQuantity { get; set; }
        public uint xmin { get; set; }

        public int AvailableQuantity => Quantity - ReservedQuantity;

        public void InitializeStock(int initialQuantity, int minQuantity)
        {
            Quantity = initialQuantity;
            MinQuantity = minQuantity;
            ReservedQuantity = 0;
        }

        public void ReceiveStock(int quantity)
        {
            if (quantity < 0) throw new InvalidOperationException("Cannot receive negative quantity.");
            Quantity += quantity;
        }

        public void ReserveStock(int quantity)
        {
            if (quantity < 0) throw new InvalidOperationException("Cannot reserve negative quantity.");
            if (AvailableQuantity < quantity) throw new InvalidOperationException($"Insufficient available stock. Available: {AvailableQuantity}, Requested: {quantity}");
            ReservedQuantity += quantity;
        }

        public void ReleaseReservedStock(int quantity)
        {
            if (quantity < 0) throw new InvalidOperationException("Cannot release negative quantity.");
            if (ReservedQuantity < quantity) throw new InvalidOperationException("Cannot release more than reserved quantity.");
            ReservedQuantity -= quantity;
        }

        public void ShipStock(int quantity)
        {
            if (quantity < 0) throw new InvalidOperationException("Cannot ship negative quantity.");
            if (Quantity < quantity) throw new InvalidOperationException("Cannot ship more than current total quantity.");
            if (ReservedQuantity < quantity)
            {
                // If shipping more than reserved, just deduct from quantity and set reserved to 0.
                Quantity -= quantity;
                ReservedQuantity = 0;
            }
            else
            {
                Quantity -= quantity;
                ReservedQuantity -= quantity;
            }

            CheckForLowStock();
        }

        public void AdjustStock(int newQuantity)
        {
            if (newQuantity < 0) throw new InvalidOperationException("Stock quantity cannot be negative.");
            Quantity = newQuantity;

            CheckForLowStock();
        }

        private void CheckForLowStock()
        {
            if (AvailableQuantity <= MinQuantity)
            {
                AddDomainEvent(new Events.ProductStockLowEvent(ProductId, WarehouseId, AvailableQuantity, MinQuantity));
            }
        }
    }
}
