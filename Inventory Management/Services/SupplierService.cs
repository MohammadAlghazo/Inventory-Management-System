using Inventory_Management._DbContext;
using Inventory_Management.Dtos;
using Inventory_Management.Models;
using Inventory_Management.Common;
using Microsoft.EntityFrameworkCore;

namespace Inventory_Management.Services
{
    public interface ISupplierService
    {
        Task<ApiResponse<IEnumerable<SupplierDto>>> GetAllSuppliersAsync();
        Task<ApiResponse<SupplierDto>> GetSupplierByIdAsync(int id);
        Task<ApiResponse<SupplierDto>> CreateSupplierAsync(CreateSupplierDto dto);
        Task<ApiResponse<SupplierDto>> UpdateSupplierAsync(int id, UpdateSupplierDto dto);
        Task<ApiResponse<bool>> DeleteSupplierAsync(int id);
    }

    public class SupplierService : ISupplierService
    {
        private readonly AppDbContext _context;

        public SupplierService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<IEnumerable<SupplierDto>>> GetAllSuppliersAsync()
        {
            var suppliers = await _context.Suppliers
                .OrderByDescending(s => s.Id)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Phone = s.Phone,
                    Email = s.Email,
                    Address = s.Address,
                    TaxNumber = s.TaxNumber,
                    IsActive = s.IsActive,
                    CreatedAt = s.CreatedAt
                })
                .ToListAsync();

            return ApiResponse<IEnumerable<SupplierDto>>.Ok(suppliers);
        }

        public async Task<ApiResponse<SupplierDto>> GetSupplierByIdAsync(int id)
        {
            var s = await _context.Suppliers.FindAsync(id);
            if (s == null) return ApiResponse<SupplierDto>.NotFound("Supplier not found");

            return ApiResponse<SupplierDto>.Ok(new SupplierDto
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                TaxNumber = s.TaxNumber,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            });
        }

        public async Task<ApiResponse<SupplierDto>> CreateSupplierAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                Name = dto.Name,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                TaxNumber = dto.TaxNumber,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();

            return ApiResponse<SupplierDto>.Created(new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                TaxNumber = supplier.TaxNumber,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            }, "Supplier created successfully");
        }

        public async Task<ApiResponse<SupplierDto>> UpdateSupplierAsync(int id, UpdateSupplierDto dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return ApiResponse<SupplierDto>.NotFound("Supplier not found");

            supplier.Name = dto.Name;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;
            supplier.TaxNumber = dto.TaxNumber;
            supplier.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return ApiResponse<SupplierDto>.Ok(new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                TaxNumber = supplier.TaxNumber,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt
            }, "Supplier updated successfully");
        }

        public async Task<ApiResponse<bool>> DeleteSupplierAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return ApiResponse<bool>.NotFound("Supplier not found");

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Supplier deleted successfully");
        }
    }
}
