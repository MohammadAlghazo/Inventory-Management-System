using System.ComponentModel.DataAnnotations;

namespace InventoryManagement.Domain.Entities
{
    public class ProductStock
    {
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int WarehouseId { get; set; }
        public Warehouse Warehouse { get; set; } = null!;

        public int Quantity { get; set; }
        public int ReservedQuantity { get; set; }
        public int MinQuantity { get; set; }
        public uint xmin { get; set; }
    }
}
