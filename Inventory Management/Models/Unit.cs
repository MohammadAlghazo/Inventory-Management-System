namespace Inventory_Management.Models
{
    public class Unit
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // e.g. Piece, KG, Box, Carton, Liter
        public string Abbreviation { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
