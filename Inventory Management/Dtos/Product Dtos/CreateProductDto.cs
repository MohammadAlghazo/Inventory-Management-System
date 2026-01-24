namespace Inventory_Management.Dtos
{
    public class CreateProductDto
    {
        public string Name { get; set; }
        public Decimal Price { get; set; }
        public int Quantity { get; set; }
        public int minQuantity { get; set; }

    }
}
