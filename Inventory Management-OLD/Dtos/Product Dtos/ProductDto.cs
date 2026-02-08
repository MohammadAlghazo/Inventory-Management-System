namespace Inventory_Management.Dtos
{
    public class ProductDto
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public Decimal? Price { get; set; }
        public int? Quantity { get; set; }
        public int? MinQuantity { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }
}
