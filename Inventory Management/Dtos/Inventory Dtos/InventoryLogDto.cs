using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace Inventory_Management.Dtos.Inventory_Dtos
{
    public class InventoryLogDto
    {
        public long Id { get; set; }
        public long ProductId { get; set; }
        public string ProductName { get; set; }
        public string Action { get; set; }
        public int QuantityChanged { get; set; }
        public DateTime ActionDate { get; set; }

    }
}
