namespace Inventory_Management.Dtos
{
    public class UpdateProductDto
    {
        public int? Id { get; set; }
        public string? Name { get; set; }
        public Decimal? Price { get; set; }
        public int? MinQuantity { get; set; }
    }
}
