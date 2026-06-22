namespace InventoryManagement.Domain.Entities
{
    public class Unit
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; 
        public string Abbreviation { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
