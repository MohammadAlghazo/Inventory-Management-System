using System.ComponentModel.DataAnnotations;

namespace Inventory_Management.Dtos
{
    public class SupplierDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSupplierDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class UpdateSupplierDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
}
